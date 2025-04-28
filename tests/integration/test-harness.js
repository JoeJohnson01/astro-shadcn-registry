#!/usr/bin/env node

/**
 * Test harness for astro-shadcn-registry integration
 *
 * This script:
 * 1. Creates a temporary directory for testing
 * 2. Initializes a new Astro project
 * 3. Links the local integration
 * 4. Tests the integration with a build
 * 5. Cleans up after testing
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Set rootDir to the project root (two levels up from the test file)
const rootDir = path.resolve(__dirname, "../..");

// Read package details
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
);
const packageName = packageJson.name;

// Function to create a temporary directory for testing
export function createTempDirectory() {
  const tempDir = path.join(
    os.tmpdir(),
    `astro-integration-test-${Date.now()}`
  );
  console.log(`Creating temporary directory: ${tempDir}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

// Function to initialize a new Astro project
export function initializeAstroProject(tempDir) {
  console.log("Initializing Astro project...");
  try {
    // Run the create-astro command with mixed stdio to be able to see output but also capture it
    execSync(
      "npm create astro@latest -- --template minimal --no-install --no-git --yes",
      { cwd: tempDir, stdio: "inherit" }
    );
    console.log("Astro project initialized successfully");

    // List files in the temp directory to find the created project directory
    const files = fs.readdirSync(tempDir);
    const projectDirs = files.filter(
      (file) =>
        fs.statSync(path.join(tempDir, file)).isDirectory() &&
        !file.startsWith(".") // Skip hidden directories
    );

    // The created project directory should be the only non-hidden directory
    if (projectDirs.length === 1) {
      const createdDirName = projectDirs[0];
      console.log(`Detected project directory: ${createdDirName}`);
      return path.join(tempDir, createdDirName);
    } else if (projectDirs.length > 1) {
      // If there are multiple directories, look for one that has package.json
      for (const dir of projectDirs) {
        if (fs.existsSync(path.join(tempDir, dir, "package.json"))) {
          console.log(`Detected project directory: ${dir}`);
          return path.join(tempDir, dir);
        }
      }
    }

    // Fallback to traditional name if detection fails
    console.log(
      "Could not reliably detect project directory, using default: my-astro-site"
    );
    return path.join(tempDir, "my-astro-site");
  } catch (error) {
    console.error("Failed to initialize Astro project:", error);
    throw error;
  }
}

// Function to update package.json to include local integration
export function updatePackageJson(projectDir) {
  console.log("Updating package.json...");
  const projectPackagePath = path.join(projectDir, "package.json");

  // Read the project's package.json
  const projectPackage = JSON.parse(
    fs.readFileSync(projectPackagePath, "utf8")
  );

  // Add dependency to local integration
  projectPackage.dependencies = projectPackage.dependencies || {};
  projectPackage.dependencies[packageName] = `file:${rootDir}`;

  // Write the updated package.json
  fs.writeFileSync(
    projectPackagePath,
    JSON.stringify(projectPackage, null, 2),
    "utf8"
  );
  console.log(`Added dependency on local ${packageName}`);
}

// Function to install dependencies
export function installDependencies(projectDir) {
  console.log("Installing dependencies...");
  try {
    execSync("npm install", { cwd: projectDir, stdio: "inherit" });
    console.log("Dependencies installed successfully");
  } catch (error) {
    console.error("Failed to install dependencies:", error);
    throw error;
  }
}

// Function to update astro.config.mjs to include the integration
export function updateAstroConfig(projectDir) {
  console.log("Updating Astro configuration...");
  const configPath = path.join(projectDir, "astro.config.mjs");

  // Create a new config file with the integration
  const configContent = `import { defineConfig } from 'astro/config';\nimport shadcnRegistry from '${packageName}';\n\nexport default defineConfig({\n  integrations: [shadcnRegistry()],\n});\n`;

  // Write the config file
  fs.writeFileSync(configPath, configContent, "utf8");
  console.log("Astro configuration updated with integration");
}

// Function to test the build
export function testBuild(projectDir) {
  console.log("Testing build process...");
  try {
    execSync("npm run build", { cwd: projectDir, stdio: "inherit" });
    console.log("Build completed successfully");
    return true;
  } catch (error) {
    console.error("Build failed:", error);
    return false;
  }
}

// Function to clean up
export function cleanup(tempDir) {
  console.log(`Cleaning up temporary directory: ${tempDir}`);
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Failed to clean up:", error);
  }
}

// Default export for the test harness
export default async function runTestHarness(options = { autoCleanup: false }) {
  let tempDir = null;

  try {
    // Create temporary directory
    tempDir = createTempDirectory();

    // Initialize Astro project
    const projectDir = initializeAstroProject(tempDir);

    // Update package.json
    updatePackageJson(projectDir);

    // Install dependencies
    installDependencies(projectDir);

    // Update Astro config
    updateAstroConfig(projectDir);

    // Test build
    const buildSuccess = testBuild(projectDir);

    // Report final result
    if (buildSuccess) {
      console.log("\n✅ Integration test completed successfully");
      const result = { success: true, tempDir, projectDir };

      // Optionally clean up if autoCleanup is enabled
      if (options.autoCleanup && tempDir) {
        cleanup(tempDir);
      }

      return result;
    } else {
      console.log("\n❌ Integration test failed");

      // Optionally clean up if autoCleanup is enabled
      if (options.autoCleanup && tempDir) {
        cleanup(tempDir);
      }

      return { success: false, tempDir, projectDir };
    }
  } catch (error) {
    console.error("\n❌ Test harness failed:", error);

    // Optionally clean up if autoCleanup is enabled
    if (options.autoCleanup && tempDir) {
      cleanup(tempDir);
    }

    return { success: false, tempDir, error };
  }
}

// Only run the test harness when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTestHarness({ autoCleanup: true })
    .then(({ success }) => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Unhandled error in test harness:", error);
      process.exit(1);
    });
}
