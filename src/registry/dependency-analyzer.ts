import fs from "fs";
import path from "path";
import * as esl from "es-module-lexer";
import { logger as defaultLogger } from "../utils/logger";
import type { RegistryEntry } from "../types";

// Use a variable that can be overridden for testing
let logger = defaultLogger;

/**
 * Set the logger to use for dependency analysis
 * @param newLogger Logger to use
 */
export function setLogger(newLogger: any): void {
  logger = newLogger;
}

// Initialize es-module-lexer
let initialized = false;

/**
 * Ensure es-module-lexer is initialized
 */
async function ensureInitialized(): Promise<void> {
  if (!initialized) {
    await esl.init;
    initialized = true;
  }
}

/**
 * Extract imports from a file
 * @param filePath Path to the file
 * @returns Array of import paths
 */
export async function extractImports(filePath: string): Promise<string[]> {
  try {
    await ensureInitialized();

    if (!fs.existsSync(filePath)) {
      // Just log at debug level to avoid cluttering test output
      logger.debug(`File not found: ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const fileExt = path.extname(filePath);

    // Make sure fileExt exists before calling toLowerCase()
    const normalizedExt = fileExt ? fileExt.toLowerCase() : "";

    // Skip non-JS/TS files
    if (
      ![".js", ".jsx", ".ts", ".tsx", ".astro", ".vue"].includes(normalizedExt)
    ) {
      return [];
    }

    try {
      // Parse imports using es-module-lexer
      const [imports] = esl.parse(fileContent);

      // Extract import paths
      return imports
        .map((imp) => {
          const importPath = fileContent.substring(imp.s, imp.e);
          // Remove quotes and trim
          return importPath.replace(/['"`]/g, "").trim();
        })
        .filter(Boolean); // Filter out empty strings
    } catch (parseError) {
      // Fallback to regex-based import extraction if es-module-lexer fails
      // Log at debug level in test environment to avoid cluttering output
      if (process.env.NODE_ENV === "test") {
        logger.debug(
          `Using fallback import extraction for ${filePath} due to parsing error`
        );
      } else {
        logger.warn(
          `Using fallback import extraction for ${filePath} due to parsing error`
        );
      }

      // Simple regex to match import statements
      // This won't catch all edge cases but should work for most common imports
      const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"];?/g;
      const matches = [];
      let match;

      while ((match = importRegex.exec(fileContent)) !== null) {
        if (match[1]) matches.push(match[1]);
      }

      return matches;
    }
  } catch (error) {
    logger.error(`Error extracting imports from ${filePath}: ${error}`);
    return [];
  }
}

/**
 * Check if a path is a package import
 * @param importPath Import path to check
 * @returns True if the path is a package import, false otherwise
 */
export function isPackageImport(importPath: string): boolean {
  // Package imports typically don't start with ./ or ../ or @/
  return (
    !importPath.startsWith(".") &&
    !importPath.startsWith("/") &&
    !importPath.startsWith("@/") &&
    !importPath.startsWith("@components/") &&
    !importPath.includes(":")
  );
}

/**
 * Resolve a relative import path to an absolute path
 * @param importPath Import path to resolve
 * @param currentFilePath Path of the file containing the import
 * @param projectRoot Root of the project
 * @returns Resolved absolute path
 */
export function resolveImportPath(
  importPath: string,
  currentFilePath: string,
  projectRoot: string = process.cwd()
): string {
  const currentDir = path.dirname(currentFilePath);

  // Handle relative imports
  if (importPath.startsWith(".")) {
    // Use path.normalize to handle ../ and ./ properly
    return path.normalize(path.join(currentDir, importPath));
  }

  // Handle absolute imports (based on tsconfig paths)
  if (importPath.startsWith("@/")) {
    return path.resolve(projectRoot, "src", importPath.substring(2));
  }

  if (importPath.startsWith("@components/")) {
    return path.resolve(
      projectRoot,
      "src/components",
      importPath.substring(12)
    );
  }

  // For other imports, assume they're package imports
  return importPath;
}

/**
 * Find a registry entry that contains a specific file
 * @param filePath Path to the file
 * @param entries Array of registry entries
 * @returns Registry entry if found, null otherwise
 */
export function findRegistryEntryForFile(
  filePath: string,
  entries: RegistryEntry[]
): RegistryEntry | null {
  // Normalize and handle potential extensions
  const normalizedPath = path.normalize(filePath);
  const pathWithoutExt = normalizedPath.replace(/\.[^/.]+$/, ""); // Remove extension if present

  // Try different extensions if the file doesn't have one
  const possiblePaths = [
    normalizedPath,
    pathWithoutExt,
    `${pathWithoutExt}.js`,
    `${pathWithoutExt}.jsx`,
    `${pathWithoutExt}.ts`,
    `${pathWithoutExt}.tsx`,
    `${pathWithoutExt}.astro`,
  ];

  for (const entry of entries) {
    for (const file of entry.frontmatter.files) {
      const entryFilePath = path.resolve(process.cwd(), file.path);
      const normalizedEntryPath = path.normalize(entryFilePath);
      const entryPathWithoutExt = normalizedEntryPath.replace(/\.[^/.]+$/, "");

      // Check all possible paths against the entry path
      for (const possiblePath of possiblePaths) {
        // Check if paths match exactly
        if (
          possiblePath === normalizedEntryPath ||
          possiblePath === entryPathWithoutExt
        ) {
          return entry;
        }

        // Check if the path is a substring of the other (handles partial paths)
        const baseName = path.basename(possiblePath);
        const entryBaseName = path.basename(normalizedEntryPath);

        if (
          // Full path matches
          normalizedEntryPath.includes(possiblePath) ||
          possiblePath.includes(normalizedEntryPath) ||
          // Base name matches (for handling @/ imports)
          baseName === entryBaseName ||
          baseName.replace(/\.[^/.]+$/, "") ===
            entryBaseName.replace(/\.[^/.]+$/, "")
        ) {
          return entry;
        }
      }
    }
  }

  return null;
}

/**
 * Analyze dependencies for a registry entry
 * @param entry Registry entry to analyze
 * @param allEntries All registry entries
 * @param projectRoot Root of the project
 * @returns Object containing dependencies found
 */
export async function analyzeDependencies(
  entry: RegistryEntry,
  allEntries: RegistryEntry[],
  projectRoot: string = process.cwd()
): Promise<{
  packageDependencies: string[];
  internalDependencies: string[];
  unknownImports: { path: string; resolved: string }[];
}> {
  const packageDependencies: string[] = [];
  const internalDependencies: string[] = [];
  const unknownImports: { path: string; resolved: string }[] = [];

  // Get all files referenced in the entry
  const entryFiles = entry.frontmatter.files.map((file) => {
    return path.resolve(projectRoot, file.path);
  });

  // Process each file to extract imports
  for (const filePath of entryFiles) {
    logger.debug(
      `Analyzing imports in ${path.relative(projectRoot, filePath)}`
    );

    // Extract imports
    const imports = await extractImports(filePath);

    // Process each import
    for (const importPath of imports) {
      // Skip relative imports that include query parameters (like ?raw)
      if (importPath.includes("?")) {
        continue;
      }

      let isHandled = false;

      // Check if it's a package import
      if (isPackageImport(importPath)) {
        const packageName = importPath.split("/")[0];
        if (!packageDependencies.includes(packageName)) {
          packageDependencies.push(packageName);
        }
        isHandled = true;
      }

      if (!isHandled) {
        // Resolve the import path to an absolute path
        const resolvedPath = resolveImportPath(
          importPath,
          filePath,
          projectRoot
        );
        logger.debug(`Resolved import '${importPath}' to '${resolvedPath}'`);

        // Check if this import is from another registry entry
        const dependencyEntry = findRegistryEntryForFile(
          resolvedPath,
          allEntries
        );

        if (dependencyEntry) {
          // Skip self-dependencies
          if (dependencyEntry.name === entry.name) {
            isHandled = true; // Mark as handled (self-dependency)
          } else {
            // Add to internal dependencies if not already there
            if (!internalDependencies.includes(dependencyEntry.name)) {
              internalDependencies.push(dependencyEntry.name);
            }
            isHandled = true;
          }
        }

        if (!isHandled) {
          // This import is not from a known registry entry
          unknownImports.push({
            path: importPath,
            resolved: resolvedPath,
          });
        }
      }
    }
  }

  return {
    packageDependencies,
    internalDependencies,
    unknownImports,
  };
}
