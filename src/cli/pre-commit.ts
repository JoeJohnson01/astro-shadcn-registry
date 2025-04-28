import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { logger } from "../utils/logger";
import { generateRegistry } from "../registry/generate";
import type { ShadcnRegistryConfig } from "../types";

/**
 * Check if a file matches any of the patterns
 * @param filePath Path to the file
 * @param patterns Array of glob patterns
 * @returns True if the file matches any pattern
 */
function fileMatchesPatterns(filePath: string, patterns: string[]): boolean {
  // Simple pattern matching for now
  // In a real implementation, we would use a proper glob matching library
  for (const pattern of patterns) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`);
    if (regex.test(filePath)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the list of files that have been modified in the current commit
 * @returns Array of modified file paths
 */
function getModifiedFiles(): string[] {
  try {
    // Get the list of staged files
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    logger.error(`Failed to get modified files: ${error}`);
    return [];
  }
}

/**
 * Run the pre-commit hook
 * @param config Configuration for the integration
 * @returns True if the hook succeeded, false otherwise
 */
export async function runPreCommitHook(
  config: ShadcnRegistryConfig
): Promise<boolean> {
  logger.info("Running pre-commit hook");

  // Check if pre-commit hook is enabled
  if (!config.preCommitHook?.enabled) {
    logger.info("Pre-commit hook is disabled");
    return true;
  }

  // Get the list of modified files
  const modifiedFiles = getModifiedFiles();
  logger.debug(`Found ${modifiedFiles.length} modified files`);

  // Check if any of the modified files match the patterns
  const matchingFiles = modifiedFiles.filter((file) =>
    fileMatchesPatterns(file, config.preCommitHook?.paths || [])
  );

  if (matchingFiles.length === 0) {
    logger.info("No registry files have been modified");
    return true;
  }

  logger.info(`Found ${matchingFiles.length} modified registry files`);

  // Generate the registry
  try {
    const outPath = await generateRegistry(config);
    logger.success(`Generated registry at ${outPath}`);

    // Stage the generated registry file
    try {
      execSync(`git add ${outPath}`, { encoding: "utf-8" });
      logger.success(`Staged registry file: ${outPath}`);
    } catch (error) {
      logger.error(`Failed to stage registry file: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Failed to generate registry: ${error}`);
    return false;
  }
}

/**
 * Install the pre-commit hook
 * @param config Configuration for the integration
 * @returns True if the hook was installed successfully, false otherwise
 */
export function installPreCommitHook(config: ShadcnRegistryConfig): boolean {
  logger.info("Installing pre-commit hook");

  // Check if pre-commit hook is enabled
  if (!config.preCommitHook?.enabled) {
    logger.info("Pre-commit hook is disabled");
    return true;
  }

  try {
    // Create the .git/hooks directory if it doesn't exist
    const hooksDir = path.join(process.cwd(), ".git", "hooks");
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Create the pre-commit hook script
    const preCommitPath = path.join(hooksDir, "pre-commit");
    const preCommitScript = `#!/bin/sh
# astro-shadcn-registry pre-commit hook
npx astro registry:generate || exit 1
`;

    fs.writeFileSync(preCommitPath, preCommitScript, { mode: 0o755 });
    logger.success(`Installed pre-commit hook at ${preCommitPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to install pre-commit hook: ${error}`);
    return false;
  }
}

/**
 * Uninstall the pre-commit hook
 * @returns True if the hook was uninstalled successfully, false otherwise
 */
export function uninstallPreCommitHook(): boolean {
  logger.info("Uninstalling pre-commit hook");

  try {
    // Remove the pre-commit hook script
    const preCommitPath = path.join(
      process.cwd(),
      ".git",
      "hooks",
      "pre-commit"
    );
    if (fs.existsSync(preCommitPath)) {
      // Check if it's our hook
      const content = fs.readFileSync(preCommitPath, "utf-8");
      if (content.includes("astro-shadcn-registry")) {
        fs.unlinkSync(preCommitPath);
        logger.success(`Uninstalled pre-commit hook at ${preCommitPath}`);
      } else {
        logger.warn(
          `Pre-commit hook at ${preCommitPath} was not created by astro-shadcn-registry`
        );
      }
    } else {
      logger.info("No pre-commit hook found");
    }
    return true;
  } catch (error) {
    logger.error(`Failed to uninstall pre-commit hook: ${error}`);
    return false;
  }
}
