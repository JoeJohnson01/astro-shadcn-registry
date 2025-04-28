#!/usr/bin/env node

/**
 * This script runs after installation to set up the necessary scripts in the host project.
 * It adds build:registry script to package.json if it doesn't exist.
 */

// Use ES module imports for compatibility with type: module
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only run in the host project, not during development of the package itself
if (process.env.INIT_CWD && process.env.INIT_CWD !== process.cwd()) {
  const hostPackagePath = path.join(process.env.INIT_CWD, "package.json");

  if (fs.existsSync(hostPackagePath)) {
    try {
      console.log("Setting up astro-shadcn-registry in your project...");

      // Read the host project's package.json
      const hostPackage = JSON.parse(fs.readFileSync(hostPackagePath, "utf8"));

      // Initialize scripts object if it doesn't exist
      if (!hostPackage.scripts) {
        hostPackage.scripts = {};
      }

      // Add the build:registry script if it doesn't exist
      let scriptsModified = false;

      if (!hostPackage.scripts["build:registry"]) {
        hostPackage.scripts["build:registry"] = "astro-shadcn-registry build";
        console.log("✅ Added build:registry script to package.json");
        scriptsModified = true;
      }

      // Add a postbuild script to run the registry build after the main build if it doesn't exist
      if (!hostPackage.scripts["postbuild"] && hostPackage.scripts["build"]) {
        hostPackage.scripts["postbuild"] = "npm run build:registry";
        console.log(
          "✅ Added postbuild script to automatically build registry after main build"
        );
        scriptsModified = true;
      }

      // Write the updated package.json if changes were made
      if (scriptsModified) {
        fs.writeFileSync(
          hostPackagePath,
          JSON.stringify(hostPackage, null, 2) + "\n"
        );
        console.log("✨ astro-shadcn-registry setup complete!");
      } else {
        console.log(
          "ℹ️ No changes needed - scripts already exist in package.json"
        );
      }

      // Make the CLI executable
      try {
        const cliPath = path.join(__dirname, "..", "bin", "cli.js");
        if (fs.existsSync(cliPath)) {
          execSync(`chmod +x "${cliPath}"`, { stdio: "ignore" });
          console.log("✅ Made CLI executable");
        }
      } catch (chmodError) {
        console.warn("⚠️ Could not make CLI executable:", chmodError.message);
        console.log(
          "   You may need to run: chmod +x node_modules/astro-shadcn-registry/bin/cli.js"
        );
      }
    } catch (error) {
      console.error(
        "❌ Error setting up astro-shadcn-registry:",
        error.message
      );
    }
  } else {
    console.warn("⚠️ Could not find package.json in the host project");
  }
}
