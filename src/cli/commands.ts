#!/usr/bin/env node
import { logger } from "../utils/logger";
import { generateRegistry } from "../registry/generate";
import { setup } from "./setup";
import { validateRegistry } from "./validate";
import { installPreCommitHook, uninstallPreCommitHook } from "./pre-commit";
import type { ShadcnRegistryConfig } from "../types";
import { mergeConfig } from "../config";

// If this file is run directly from the command line
// Only run this in a Node.js environment, not during testing
if (typeof process !== "undefined" && process.argv && process.argv.length > 1) {
  try {
    // This will only work in a real Node.js environment
    const scriptUrl = new URL(process.argv[1], `file://${process.cwd()}/`).href;
    if (import.meta.url === scriptUrl) {
      const command = process.argv[2];
      const defaultConfig = mergeConfig({});

      logger.debug(`Running command: ${command}`);

      switch (command) {
        case "registry:setup":
          setupCommand(defaultConfig).catch((err) => {
            logger.error(`Setup failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:generate":
          generateCommand(defaultConfig).catch((err) => {
            logger.error(`Generate failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:validate":
          validateCommand(defaultConfig).catch((err) => {
            logger.error(`Validation failed: ${err}`);
            process.exit(1);
          });
          break;
        case "registry:install-hook":
          installHookCommand(defaultConfig);
          break;
        case "registry:uninstall-hook":
          uninstallHookCommand();
          break;
        default:
          logger.error(`Unknown command: ${command}`);
          logger.info("Available commands:");
          logger.info("  registry:setup - Run the setup wizard");
          logger.info("  registry:generate - Generate the registry.json file");
          logger.info(
            "  registry:validate - Validate the registry configuration"
          );
          logger.info("  registry:install-hook - Install the pre-commit hook");
          logger.info(
            "  registry:uninstall-hook - Uninstall the pre-commit hook"
          );
          process.exit(1);
      }
    }
  } catch (error) {
    // Ignore errors when running in test environment
    logger.debug(`Error in CLI command detection: ${error}`);
  }
}

/**
 * Command to generate the registry.json file
 * @param config Configuration for the integration
 */
export async function generateCommand(
  config: ShadcnRegistryConfig
): Promise<void> {
  logger.info("Generating registry.json");
  try {
    const outPath = await generateRegistry(config, logger);
    logger.info(`Generated registry at ${outPath}`);
  } catch (error) {
    logger.error(`Failed to generate registry: ${error}`);
    process.exit(1);
  }
}

/**
 * Command to run the setup wizard
 * @param config Configuration for the integration
 */
export async function setupCommand(
  config: ShadcnRegistryConfig
): Promise<void> {
  logger.info("Running setup wizard");
  try {
    await setup(config);
    logger.success("Setup completed successfully");
  } catch (error) {
    logger.error(`Setup failed: ${error}`);
    process.exit(1);
  }
}

/**
 * Command to validate the registry configuration and component structure
 * @param config Configuration for the integration
 */
export async function validateCommand(
  config: ShadcnRegistryConfig
): Promise<void> {
  logger.info("Validating registry configuration and component structure");
  try {
    await validateRegistry(config);
    logger.success("Registry validation completed successfully");
  } catch (error) {
    logger.error(`Validation failed: ${error}`);
    process.exit(1);
  }
}

/**
 * Command to install the pre-commit hook
 * @param config Configuration for the integration
 */
export function installHookCommand(config: ShadcnRegistryConfig): void {
  logger.info("Installing pre-commit hook");
  try {
    const success = installPreCommitHook(config);
    if (success) {
      logger.success("Pre-commit hook installed successfully");
    } else {
      logger.error("Failed to install pre-commit hook");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to install pre-commit hook: ${error}`);
    process.exit(1);
  }
}

/**
 * Command to uninstall the pre-commit hook
 */
export function uninstallHookCommand(): void {
  logger.info("Uninstalling pre-commit hook");
  try {
    const success = uninstallPreCommitHook();
    if (success) {
      logger.success("Pre-commit hook uninstalled successfully");
    } else {
      logger.error("Failed to uninstall pre-commit hook");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to uninstall pre-commit hook: ${error}`);
    process.exit(1);
  }
}

/**
 * Register CLI commands with Astro
 * @param cli Astro CLI object
 * @param config Configuration for the integration
 */
export function registerCommands(cli: any, config: ShadcnRegistryConfig): void {
  logger.debug("Registering CLI commands with Astro");

  try {
    // Register the registry:generate command
    cli
      .createCommand("registry:generate")
      .describe("Generate the registry.json file")
      .action(async () => {
        await generateCommand(config);
      });

    // Register the registry:setup command
    cli
      .createCommand("registry:setup")
      .describe("Run the setup wizard to configure the integration")
      .action(async () => {
        await setupCommand(config);
      });

    // Register the registry:validate command
    cli
      .createCommand("registry:validate")
      .describe("Validate the registry configuration and component structure")
      .action(async () => {
        await validateCommand(config);
      });

    // Register the registry:install-hook command
    cli
      .createCommand("registry:install-hook")
      .describe("Install the pre-commit hook")
      .action(() => {
        installHookCommand(config);
      });

    // Register the registry:uninstall-hook command
    cli
      .createCommand("registry:uninstall-hook")
      .describe("Uninstall the pre-commit hook")
      .action(() => {
        uninstallHookCommand();
      });
  } catch (error) {
    logger.error(`Failed to register commands: ${error}`);
    logger.info(
      "Commands can still be run using npx astro-shadcn-registry <command>"
    );
  }
}
