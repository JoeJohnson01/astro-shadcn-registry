#!/usr/bin/env node

// This is the main CLI entry point for the astro-shadcn-registry package
// It loads the bundled module and handles command routing

// Import the module dynamically using ESM
import { createRequire } from "module";
import { setupScripts } from "./setup-scripts.js";
const require = createRequire(import.meta.url);

// Check if we're being run as part of astro add
const isAstroAdd = process.env.ASTRO_ADD === "true";

// Use dynamic import for ESM compatibility
async function runCommand() {
  try {
    // Simple command router
    const command = process.argv[2] || "build";

    // Import the module dynamically
    const module = await import("../dist/index.mjs");

    // Map commands to their implementations
    const commands = {
      build: async () => {
        console.log("Building registry...");
        // Use the generateRegistry function and then build with shadcn
        const { generateRegistry, buildShadcnRegistry, defaultConfig } = module;
        // Use the default config from the module
        const config = defaultConfig || {};
        const logger = {
          info: console.log,
          error: console.error,
          warn: console.warn,
          success: console.log,
          debug: console.log,
          spinner: (msg) => {
            console.log(msg);
            return {
              update: console.log,
              complete: console.log,
              error: console.error,
            };
          },
        };

        try {
          const outPath = await generateRegistry(config, logger);
          console.log(`Generated registry at ${outPath}`);
          await buildShadcnRegistry(outPath, logger);

          // Always delete the registry.json file after building
          const { deleteRegistryFile } = module;
          if (typeof deleteRegistryFile === "function") {
            console.log("Deleting registry.json file...");
            await deleteRegistryFile(outPath, logger);
            console.log("Registry.json file deleted successfully");
          }
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      },
      setup: async () => {
        console.log("Running setup...");

        // If we're being run as part of astro add, set the environment variable
        // so the setup wizard knows not to try to update astro.config.mjs
        if (isAstroAdd) {
          process.env.ASTRO_ADD = "true";
          console.log("Running as part of astro add installation");
        }

        // First run the setupScripts to add necessary scripts to package.json
        const scriptsSetup = await setupScripts();
        if (scriptsSetup) {
          console.log(
            "Scripts setup complete, now running main setup wizard..."
          );
          // Use the setup function directly
          const { setup } = module;
          if (typeof setup === "function") {
            await setup();
          } else {
            console.log("Setup wizard not available, scripts setup completed.");
          }
        }
      },
      validate: async () => {
        console.log("Validating registry...");
        // Use the validateRegistry function directly
        const { validateRegistry } = module;
        if (typeof validateRegistry === "function") {
          await validateRegistry();
        } else {
          console.error("Validation function not available");
          process.exit(1);
        }
      },
      help: () => {
        console.log("astro-shadcn-registry CLI");
        console.log("");
        console.log("Commands:");
        console.log(
          "  build     Generate the registry.json file and build the registry"
        );
        console.log("  setup     Run the setup wizard");
        console.log("  validate  Validate the registry configuration");
        console.log("  help      Show this help message");
      },
    };

    // Execute the command
    if (commands[command]) {
      await commands[command]();
    } else {
      console.error(`Unknown command: ${command}`);
      commands.help();
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the command
runCommand();
