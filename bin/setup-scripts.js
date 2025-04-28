#!/usr/bin/env node

/**
 * This script adds necessary scripts to the host project's package.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the setup
export async function setupScripts() {
  try {
    console.log("Setting up astro-shadcn-registry in your project...");

    // Check if we're being run as part of astro add
    const isAstroAdd = process.env.ASTRO_ADD === "true";
    if (isAstroAdd) {
      console.log("Running as part of astro add installation");
    }

    // Get the host project's package.json
    const hostPackagePath = path.join(process.cwd(), "package.json");

    if (!fs.existsSync(hostPackagePath)) {
      console.warn("⚠️ Could not find package.json in the current directory");
      return false;
    }

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
      return true;
    } else {
      console.log(
        "ℹ️ No changes needed - scripts already exist in package.json"
      );
      return true;
    }
  } catch (error) {
    console.error("❌ Error setting up astro-shadcn-registry:", error.message);
    return false;
  }
}

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupScripts().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
