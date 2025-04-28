#!/usr/bin/env node

/**
 * This script runs automatically after the package is installed.
 * It detects if the package was installed via `astro add` and runs the setup wizard if needed.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're being run as part of astro add
const isAstroAdd = process.env.ASTRO_ADD === "true";

// Only run the setup if we're not being run as part of astro add
// (astro add will handle the config file updates)
if (!isAstroAdd) {
  console.log('📦 astro-shadcn-registry installed successfully!');
  console.log('');
  console.log('To set up the integration, run:');
  console.log('  npx astro registry:setup');
  console.log('');
  console.log('Or use the direct CLI:');
  console.log('  npx astro-shadcn-registry setup');
} else {
  // If installed via astro add, we'll automatically add the build:registry script
  try {
    // Get the host project's package.json
    const hostPackagePath = join(process.cwd(), 'package.json');
    
    if (fs.existsSync(hostPackagePath)) {
      // Read the host project's package.json
      const hostPackage = JSON.parse(fs.readFileSync(hostPackagePath, 'utf8'));
      
      // Initialize scripts object if it doesn't exist
      if (!hostPackage.scripts) {
        hostPackage.scripts = {};
      }
      
      // Add the build:registry script if it doesn't exist
      let scriptsModified = false;
      
      if (!hostPackage.scripts['build:registry']) {
        hostPackage.scripts['build:registry'] = 'astro-shadcn-registry build';
        console.log('✅ Added build:registry script to package.json');
        scriptsModified = true;
      }
      
      // Add a postbuild script to run the registry build after the main build if it doesn't exist
      if (!hostPackage.scripts['postbuild'] && hostPackage.scripts['build']) {
        hostPackage.scripts['postbuild'] = 'npm run build:registry';
        console.log('✅ Added postbuild script to automatically build registry after main build');
        scriptsModified = true;
      }
      
      // Write the updated package.json if changes were made
      if (scriptsModified) {
        fs.writeFileSync(hostPackagePath, JSON.stringify(hostPackage, null, 2) + '\n');
      }
    }
  } catch (error) {
    console.error('❌ Error setting up scripts:', error.message);
  }

  console.log('');
  console.log('📦 astro-shadcn-registry installed successfully via astro add!');
  console.log('');
  console.log('To customize the integration further, run:');
  console.log('  npx astro registry:setup');
  console.log('');
}
