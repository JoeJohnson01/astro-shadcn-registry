import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Run the shadcn CLI to build the registry
 * @param registryPath Path to the registry.json file
 * @param logger Logger instance to use for output
 * @returns Promise that resolves when the build is complete
 */
export async function buildShadcnRegistry(
  registryPath: string,
  logger: any
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    logger.info('Building registry with shadcn CLI...');

    // Check if the registry.json file exists
    if (!fs.existsSync(registryPath)) {
      logger.error(`Registry file not found: ${registryPath}`);
      return reject(new Error(`Registry file not found: ${registryPath}`));
    }

    // Get the directory of the registry.json file
    const cwd = path.dirname(registryPath);

    // Run the shadcn build command
    const shadcnProcess = spawn('npx', ['shadcn', 'build'], {
      cwd,
      stdio: 'pipe',
      shell: true,
    });

    // Collect stdout
    let stdout = '';
    shadcnProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      logger.info(output.trim());
    });

    // Collect stderr
    let stderr = '';
    shadcnProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      logger.error(output.trim());
    });

    // Handle process completion
    shadcnProcess.on('close', (code) => {
      if (code === 0) {
        logger.info('Registry built successfully with shadcn CLI');
        resolve(true);
      } else {
        logger.error(`shadcn build failed with code ${code}`);
        logger.error(stderr);
        reject(new Error(`shadcn build failed with code ${code}: ${stderr}`));
      }
    });

    // Handle process errors
    shadcnProcess.on('error', (err) => {
      logger.error(`Failed to start shadcn build: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Delete the registry.json file
 * @param registryPath Path to the registry.json file
 * @param logger Logger instance to use for output
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteRegistryFile(
  registryPath: string,
  logger: any
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (fs.existsSync(registryPath)) {
        fs.unlinkSync(registryPath);
        logger.info(`Deleted registry file: ${registryPath}`);
        resolve(true);
      } else {
        logger.warn(`Registry file not found: ${registryPath}`);
        resolve(false);
      }
    } catch (error) {
      logger.error(`Failed to delete registry file: ${error}`);
      resolve(false);
    }
  });
}
