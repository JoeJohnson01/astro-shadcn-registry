import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { findContentFiles, parseRegistryEntries } from "../registry/file-utils";
import { analyzeDependencies } from "../registry/dependency-analyzer";
import type { ShadcnRegistryConfig, RegistryEntry } from "../types";

/**
 * Validate the registry configuration and component structure
 * @param config Configuration for the integration
 */
export async function validateRegistry(
  config: ShadcnRegistryConfig
): Promise<void> {
  const projectRoot = process.cwd();
  const spinner = logger.spinner("Validating registry configuration");

  try {
    // 1. Validate paths
    spinner.update("Validating paths");

    // Check if registry path exists
    if (!fs.existsSync(config.paths.registry)) {
      spinner.error(`Registry path does not exist: ${config.paths.registry}`);
      throw new Error(`Registry path does not exist: ${config.paths.registry}`);
    }

    // Check if content collection path exists
    if (!fs.existsSync(config.paths.contentCollection)) {
      spinner.error(
        `Content collection path does not exist: ${config.paths.contentCollection}`
      );
      throw new Error(
        `Content collection path does not exist: ${config.paths.contentCollection}`
      );
    }

    // Check if output registry directory exists
    const outputDir = path.dirname(
      path.join(projectRoot, config.paths.outputRegistry)
    );
    if (!fs.existsSync(outputDir)) {
      spinner.error(`Output registry directory does not exist: ${outputDir}`);
      throw new Error(`Output registry directory does not exist: ${outputDir}`);
    }

    // 2. Validate component types
    spinner.update("Validating component types");
    if (!config.componentTypes || config.componentTypes.length === 0) {
      spinner.error("No component types defined");
      throw new Error("No component types defined");
    }

    // 3. Find all MDX/MD entries from all collections
    spinner.update("Finding content files");
    const entryFiles = await findContentFiles(
      config.paths.contentCollection,
      config.componentTypes
    );

    if (entryFiles.length === 0) {
      spinner.error("No content files found");
      throw new Error("No content files found");
    }

    spinner.update(`Found ${entryFiles.length} content files`);

    // 4. Parse all entries to build registry entries
    spinner.update("Parsing registry entries");
    const registryEntries = parseRegistryEntries(entryFiles);

    if (registryEntries.length === 0) {
      spinner.error("No registry entries found");
      throw new Error("No registry entries found");
    }

    spinner.update(`Parsed ${registryEntries.length} registry entries`);

    // 5. Validate registry entries
    spinner.update("Validating registry entries");
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const entry of registryEntries) {
      // Check required fields
      if (!entry.frontmatter.title) {
        errors.push(`Entry ${entry.name} is missing a title`);
      }

      if (!entry.frontmatter.description) {
        errors.push(`Entry ${entry.name} is missing a description`);
      }

      if (!entry.frontmatter.type) {
        errors.push(`Entry ${entry.name} is missing a type`);
      } else {
        // Validate component type
        const typeWithoutPrefix = entry.frontmatter.type.replace(
          "registry:",
          ""
        );
        if (!config.componentTypes.includes(typeWithoutPrefix)) {
          errors.push(
            `Entry ${entry.name} has an invalid type: ${entry.frontmatter.type}`
          );
        }
      }

      if (!entry.frontmatter.files || entry.frontmatter.files.length === 0) {
        errors.push(`Entry ${entry.name} has no files`);
      } else {
        // Check if files exist
        for (const file of entry.frontmatter.files) {
          const filePath = path.join(projectRoot, file.path);
          if (!fs.existsSync(filePath)) {
            errors.push(
              `Entry ${entry.name} references non-existent file: ${file.path}`
            );
          }
        }
      }
    }

    // 6. Validate dependencies
    spinner.update("Validating dependencies");
    const availableComponents = new Map<string, string>();

    // Store in available components map
    for (const entry of registryEntries) {
      availableComponents.set(entry.name, entry.filePath);
    }

    for (const entry of registryEntries) {
      // Check internal dependencies
      if (entry.frontmatter.internalRegistryDependencies) {
        for (const dep of entry.frontmatter.internalRegistryDependencies) {
          if (!availableComponents.has(dep)) {
            errors.push(
              `Entry ${entry.name} depends on non-existent component: ${dep}`
            );
          }
        }
      }

      // Analyze dependencies to find missing ones
      const { packageDependencies, internalDependencies, unknownImports } =
        await analyzeDependencies(entry, registryEntries, projectRoot);

      // Check for missing package dependencies
      const declaredDeps = entry.frontmatter.dependencies || [];
      for (const pkg of packageDependencies) {
        if (!declaredDeps.includes(pkg)) {
          warnings.push(
            `Entry ${entry.name} is missing package dependency: ${pkg}`
          );
        }
      }

      // Check for missing internal dependencies
      const declaredInternalDeps =
        entry.frontmatter.internalRegistryDependencies || [];
      for (const dep of internalDependencies) {
        if (!declaredInternalDeps.includes(dep)) {
          warnings.push(
            `Entry ${entry.name} is missing internal dependency: ${dep}`
          );
        }
      }

      // Check for unknown imports
      if (unknownImports.length > 0) {
        for (const { path: importPath } of unknownImports) {
          warnings.push(
            `Entry ${entry.name} has unknown import: ${importPath}`
          );
        }
      }
    }

    // 7. Report results
    if (errors.length > 0) {
      spinner.error(`Found ${errors.length} errors`);
      for (const error of errors) {
        logger.error(error);
      }
      throw new Error(`Validation failed with ${errors.length} errors`);
    }

    if (warnings.length > 0) {
      spinner.update(`Found ${warnings.length} warnings`);
      for (const warning of warnings) {
        logger.warn(warning);
      }
    }

    spinner.complete("Registry validation completed successfully");
  } catch (error) {
    spinner.error(`Validation failed: ${error}`);
    throw error;
  }
}
