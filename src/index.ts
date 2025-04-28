import type {
  AstroIntegration,
  AstroConfig,
  AstroIntegrationLogger,
} from "astro";
import { mergeConfig, validateConfig } from "./config";
import type { ShadcnRegistryConfig } from "./types";
import { generateRegistry } from "./registry/generate";
import {
  setupCommand,
  generateCommand,
  validateCommand,
  installHookCommand,
  uninstallHookCommand,
  registerCommands,
} from "./cli/commands"; // Import individual command functions
import { installPreCommitHook, runPreCommitHook } from "./cli/pre-commit";
import { buildShadcnRegistry, deleteRegistryFile } from "./utils/shadcn";
import fs from "fs";
import path from "path";

// Use Astro's built-in logger for integration hooks
let astroLogger: AstroIntegrationLogger;

/**
 * Astro ShadCN Registry Integration
 * @param userConfig User-provided configuration
 * @returns Astro integration
 */
export default function shadcnRegistry(
  userConfig: Partial<ShadcnRegistryConfig> = {}
): AstroIntegration {
  // Merge user configuration with defaults
  const config = mergeConfig(userConfig);

  return {
    name: "astro-shadcn-registry",
    hooks: {
      "astro:config:setup": ({
        command,
        addWatchFile,
        logger: currentLogger,
      }) => {
        // Assign Astro's logger
        astroLogger = currentLogger;

        // Try to register CLI commands if the Astro version supports it
        try {
          // @ts-ignore - This is a newer Astro feature that might not be in all type definitions
          const { addCommand } = arguments[0];
          if (typeof addCommand === "function") {
            astroLogger.debug("Registering CLI commands with Astro");
            registerCommands(addCommand, config);
          }
        } catch (error) {
          astroLogger.debug(
            "Could not register CLI commands directly, falling back to astroIntegrationCommands export"
          );
        }
        // Validate configuration
        validateConfig(config);

        // Log integration setup
        astroLogger.info(`Setting up astro-shadcn-registry integration`);
        astroLogger.info(`Registry path: ${config.paths.registry}`);
        astroLogger.info(
          `Content collection path: ${config.paths.contentCollection}`
        );
        astroLogger.info(
          `Output registry path: ${config.paths.outputRegistry}`
        );

        // Add watch for registry components and content collections in dev mode
        if (command === "dev") {
          astroLogger.info(
            "Adding watch for registry components and content collections"
          );
          addWatchFile(config.paths.registry);
          addWatchFile(config.paths.contentCollection);

          // Watch the registry.json file
          const registryPath = path.join(
            process.cwd(),
            config.paths.outputRegistry
          );
          if (fs.existsSync(registryPath)) {
            addWatchFile(registryPath);
          }
        }

        // No route injection - we're only generating the registry.json file

        // Install pre-commit hook if enabled
        if (config.preCommitHook?.enabled) {
          installPreCommitHook(config);
        }
      },
      "astro:build:start": async () => {
        // Generate registry.json during build
        astroLogger.info("Generating registry.json during build");
        try {
          // Create a minimal logger with only the methods we know exist
          const minimalLogger = {
            info: (message: string) => astroLogger.info(message),
            warn: (message: string) => astroLogger.warn(message),
            error: (message: string) => astroLogger.error(message),
            // Add success method that maps to info
            success: (message: string) => astroLogger.info(message),
            // Add debug method that maps to info with a prefix
            debug: (message: string) => astroLogger.info(`[DEBUG] ${message}`),
            // Add a simple spinner implementation
            spinner: (message: string) => {
              astroLogger.info(`${message}...`);
              return {
                update: (msg: string) => astroLogger.info(`${msg}...`),
                complete: (msg: string) => astroLogger.info(msg),
                error: (msg: string) => astroLogger.error(msg),
              };
            },
          };

          const outPath = await generateRegistry(config, minimalLogger);
          astroLogger.info(`Generated registry at ${outPath}`);

          // Build the registry with shadcn CLI
          try {
            await buildShadcnRegistry(outPath, minimalLogger);

            // Delete the registry.json file if configured to do so
            if (config.advanced?.deleteRegistryAfterBuild) {
              await deleteRegistryFile(outPath, minimalLogger);
            }
          } catch (shadcnError) {
            astroLogger.error(
              `Failed to build registry with shadcn CLI: ${shadcnError}`
            );
            // Don't rethrow to allow the build to continue
          }
        } catch (error) {
          astroLogger.error(`Failed to generate registry: ${error}`);
          throw error; // Rethrow to stop the build process
        }
      },
      "astro:build:done": () => {
        astroLogger.info("Registry generation completed successfully");
      },
      "astro:server:setup": () => {
        astroLogger.info("Setting up development server");
      },
      "astro:server:start": async () => {
        // Generate registry.json when server starts
        astroLogger.info("Generating registry.json for development server");
        try {
          // Create a minimal logger with only the methods we know exist
          const minimalLogger = {
            info: (message: string) => astroLogger.info(message),
            warn: (message: string) => astroLogger.warn(message),
            error: (message: string) => astroLogger.error(message),
            // Add success method that maps to info
            success: (message: string) => astroLogger.info(message),
            // Add debug method that maps to info with a prefix
            debug: (message: string) => astroLogger.info(`[DEBUG] ${message}`),
            // Add a simple spinner implementation
            spinner: (message: string) => {
              astroLogger.info(`${message}...`);
              return {
                update: (msg: string) => astroLogger.info(`${msg}...`),
                complete: (msg: string) => astroLogger.info(msg),
                error: (msg: string) => astroLogger.error(msg),
              };
            },
          };

          const outPath = await generateRegistry(config, minimalLogger);
          astroLogger.info(`Generated registry at ${outPath}`);

          // Build the registry with shadcn CLI
          try {
            await buildShadcnRegistry(outPath, minimalLogger);

            // Delete the registry.json file if configured to do so
            if (config.advanced?.deleteRegistryAfterBuild) {
              await deleteRegistryFile(outPath, minimalLogger);
            }
          } catch (shadcnError) {
            astroLogger.error(
              `Failed to build registry with shadcn CLI: ${shadcnError}`
            );
            // Don't rethrow to allow the server to start
          }
        } catch (error) {
          astroLogger.error(`Failed to generate registry: ${error}`);
        }
      },
      "astro:dev:start": () => {
        astroLogger.info(
          "Starting development server with registry integration"
        );
      },
    },
  };
}

// Export types and utilities
export * from "./types";
export { setup } from "./cli/setup";
export { generateRegistry } from "./registry/generate";
export { validateRegistry } from "./cli/validate";
export { defaultConfig } from "./config";
export { buildShadcnRegistry, deleteRegistryFile } from "./utils/shadcn";
export {
  runPreCommitHook,
  installPreCommitHook,
  uninstallPreCommitHook,
} from "./cli/pre-commit";

// Export CLI commands for Astro to discover
export const astroIntegrationCommands = {
  "registry:setup": setupCommand,
  "registry:generate": generateCommand,
  "registry:validate": validateCommand,
  "registry:install-hook": installHookCommand,
  "registry:uninstall-hook": uninstallHookCommand,
};
