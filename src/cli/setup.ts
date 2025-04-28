import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { logger } from "../utils/logger";
import { ensureDir } from "../registry/file-utils";
import { generateContentConfig } from "../registry/templates/content-config";
import type { ShadcnRegistryConfig } from "../types";

/**
 * Run the setup wizard
 * @param config Current configuration
 * @returns Updated configuration
 */
export async function setup(
  config: ShadcnRegistryConfig
): Promise<ShadcnRegistryConfig> {
  logger.info("Starting setup wizard for astro-shadcn-registry");

  // Detect existing content collections and registry components folders
  const projectRoot = process.cwd();
  const existingContentCollections = detectContentCollections(projectRoot);
  const existingRegistryComponents = detectRegistryComponents(projectRoot);

  if (existingContentCollections.length > 0) {
    logger.info(
      `Detected existing content collections: ${existingContentCollections.join(
        ", "
      )}`
    );
  }

  if (existingRegistryComponents.length > 0) {
    logger.info(
      `Detected existing registry components: ${existingRegistryComponents.join(
        ", "
      )}`
    );
  }

  // 1. Ask for basic registry configuration
  const registryConfig = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is the name of your registry?",
      default: config.registry.name,
    },
    {
      type: "input",
      name: "homepage",
      message: "What is the homepage URL of your registry?",
      default: config.registry.homepage,
    },
  ]);

  // 2. Ask for paths configuration
  const pathsConfig = await inquirer.prompt([
    {
      type: "input",
      name: "registry",
      message: "Where are your registry components stored?",
      default: config.paths.registry,
    },
    {
      type: "input",
      name: "contentCollection",
      message: "Where are your content collections stored?",
      default: config.paths.contentCollection,
    },
    {
      type: "input",
      name: "outputRegistry",
      message: "Where should the registry.json file be output?",
      default: config.paths.outputRegistry,
    },
  ]);

  // 3. Ask for component types
  const { componentTypes } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "componentTypes",
      message: "Which component types do you want to include?",
      choices: [
        {
          name: "UI Components",
          value: "ui",
          checked: config.componentTypes.includes("ui"),
        },
        {
          name: "General Components",
          value: "component",
          checked: config.componentTypes.includes("component"),
        },
        {
          name: "Block Components",
          value: "block",
          checked: config.componentTypes.includes("block"),
        },
        {
          name: "Hooks",
          value: "hook",
          checked: config.componentTypes.includes("hook"),
        },
        {
          name: "Libraries",
          value: "lib",
          checked: config.componentTypes.includes("lib"),
        },
        {
          name: "Pages",
          value: "page",
          checked: config.componentTypes.includes("page"),
        },
        {
          name: "Files",
          value: "file",
          checked: config.componentTypes.includes("file"),
        },
        {
          name: "Styles",
          value: "style",
          checked: config.componentTypes.includes("style"),
        },
        {
          name: "Themes",
          value: "theme",
          checked: config.componentTypes.includes("theme"),
        },
      ],
      default: config.componentTypes,
    },
  ]);

  // 4. Ask for advanced options
  const advancedConfig = await inquirer.prompt([
    {
      type: "list",
      name: "defaultLanguage",
      message: "What is the default language for your components?",
      choices: ["react", "astro", "vue", "html"],
      default: config.advanced?.defaultLanguage || "react",
    },
    {
      type: "input",
      name: "registryURL",
      message: "What is the URL for your registry?",
      default: config.advanced?.registryURL || config.registry.homepage,
    },
  ]);

  // 5. Ask for pre-commit hook configuration
  const { enablePreCommitHook } = await inquirer.prompt([
    {
      type: "confirm",
      name: "enablePreCommitHook",
      message: "Do you want to enable the pre-commit hook?",
      default: config.preCommitHook?.enabled || false,
    },
  ]);

  let preCommitPaths = config.preCommitHook?.paths || ["src/registry/**/*"];
  if (enablePreCommitHook) {
    const { paths } = await inquirer.prompt([
      {
        type: "input",
        name: "paths",
        message:
          "Which paths should trigger the pre-commit hook? (comma-separated)",
        default: preCommitPaths.join(", "),
        filter: (input: string) => input.split(",").map((p) => p.trim()),
      },
    ]);
    preCommitPaths = paths;
  }

  // 6. Create the updated configuration
  const updatedConfig: ShadcnRegistryConfig = {
    paths: {
      registry: pathsConfig.registry,
      contentCollection: pathsConfig.contentCollection,
      outputRegistry: pathsConfig.outputRegistry,
    },
    componentTypes,
    registry: {
      name: registryConfig.name,
      homepage: registryConfig.homepage,
    },
    preCommitHook: {
      enabled: enablePreCommitHook,
      paths: preCommitPaths,
    },
    advanced: {
      defaultLanguage: advancedConfig.defaultLanguage as
        | "astro"
        | "react"
        | "vue"
        | "html",
      registryURL: advancedConfig.registryURL,
    },
  };

  // 7. Set up pre-commit hook if requested
  if (enablePreCommitHook) {
    const { confirmInstallHook } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmInstallHook",
        message: "Do you want to install the pre-commit hook now?",
        default: true,
      },
    ]);

    if (confirmInstallHook) {
      try {
        const { installPreCommitHook } = await import("./pre-commit");
        const success = installPreCommitHook(updatedConfig);
        if (success) {
          logger.success("Pre-commit hook installed successfully");
        } else {
          logger.error("Failed to install pre-commit hook");
        }
      } catch (error) {
        logger.error(`Failed to install pre-commit hook: ${error}`);
      }
    }
  }

  // 8. Create necessary directories
  const { createDirectories } = await inquirer.prompt([
    {
      type: "confirm",
      name: "createDirectories",
      message: "Do you want to create the necessary directories?",
      default: true,
    },
  ]);

  if (createDirectories) {
    // Create registry directory
    ensureDir(updatedConfig.paths.registry);
    logger.success(
      `Created registry directory: ${updatedConfig.paths.registry}`
    );

    // Create content collection directories for each component type
    for (const type of componentTypes) {
      // Handle the special case for 'ui' which doesn't have a plural form
      const collectionName = type === "ui" ? type : `${type}s`;
      const collectionDir = path.join(
        updatedConfig.paths.contentCollection,
        collectionName
      );
      ensureDir(collectionDir);
      logger.success(`Created content collection directory: ${collectionDir}`);
    }

    // Create content config file
    const { createContentConfig } = await inquirer.prompt([
      {
        type: "confirm",
        name: "createContentConfig",
        message: "Do you want to create a content config file?",
        default: true,
      },
    ]);

    if (createContentConfig) {
      const contentConfigPath = path.join(
        updatedConfig.paths.contentCollection,
        "config.ts"
      );
      const contentConfigContent = generateContentConfig(componentTypes);
      fs.writeFileSync(contentConfigPath, contentConfigContent, "utf-8");
      logger.success(`Created content config file: ${contentConfigPath}`);
    }
  }

  // 9. Update astro.config.mjs
  // Check if the integration was installed via astro add
  const wasInstalledViaAstroAdd = process.env.ASTRO_ADD === "true";

  // If installed via astro add, we don't need to update the config file
  // as astro add will have already done that
  const { updateAstroConfig } = wasInstalledViaAstroAdd
    ? { updateAstroConfig: false }
    : await inquirer.prompt([
        {
          type: "confirm",
          name: "updateAstroConfig",
          message: "Do you want to update your astro.config.mjs file?",
          default: true,
        },
      ]);

  if (updateAstroConfig) {
    try {
      const astroConfigPath = path.join(process.cwd(), "astro.config.mjs");
      if (fs.existsSync(astroConfigPath)) {
        let astroConfig = fs.readFileSync(astroConfigPath, "utf-8");

        // Check if the integration is already added
        if (!astroConfig.includes("astro-shadcn-registry")) {
          // Simple approach - find the integrations array and add our integration
          const integrationConfig = `
  shadcnRegistry({
    paths: {
      registry: "${updatedConfig.paths.registry}",
      contentCollection: "${updatedConfig.paths.contentCollection}",
      outputRegistry: "${updatedConfig.paths.outputRegistry}",
    },
    componentTypes: ${JSON.stringify(updatedConfig.componentTypes)},
    registry: {
      name: "${updatedConfig.registry.name}",
      homepage: "${updatedConfig.registry.homepage}",
    },
    preCommitHook: {
      enabled: ${updatedConfig.preCommitHook?.enabled || false},
      paths: ${JSON.stringify(
        updatedConfig.preCommitHook?.paths || ["src/registry/**/*"]
      )},
    },
    advanced: {
      defaultLanguage: "${updatedConfig.advanced?.defaultLanguage || "react"}",
      registryURL: "${
        updatedConfig.advanced?.registryURL || updatedConfig.registry.homepage
      }",
    },
  }),`;

          // Find the integrations array
          const integrationsMatch = astroConfig.match(/integrations\s*:\s*\[/);
          if (integrationsMatch) {
            // Insert our integration after the opening bracket
            const insertPosition =
              integrationsMatch.index! + integrationsMatch[0].length;
            astroConfig =
              astroConfig.substring(0, insertPosition) +
              integrationConfig +
              astroConfig.substring(insertPosition);
          } else {
            // If no integrations array found, add one
            const defineConfigMatch = astroConfig.match(
              /defineConfig\s*\(\s*\{/
            );
            if (defineConfigMatch) {
              const insertPosition =
                defineConfigMatch.index! + defineConfigMatch[0].length;
              astroConfig =
                astroConfig.substring(0, insertPosition) +
                `
  integrations: [${integrationConfig}
  ],` +
                astroConfig.substring(insertPosition);
            } else {
              throw new Error(
                "Could not find defineConfig in astro.config.mjs"
              );
            }
          }

          // Add import for shadcnRegistry
          const importStatement = `import shadcnRegistry from 'astro-shadcn-registry';\n`;
          astroConfig = importStatement + astroConfig;

          // Write the updated config
          fs.writeFileSync(astroConfigPath, astroConfig, "utf-8");
          logger.success(
            `Updated astro.config.mjs with integration configuration`
          );
        } else {
          logger.info("Integration already exists in astro.config.mjs");
        }
      } else {
        logger.warn(
          "astro.config.mjs not found. Please add the integration manually."
        );
      }
    } catch (error) {
      logger.error(`Failed to update astro.config.mjs: ${error}`);
    }
  }

  logger.success("Setup completed successfully!");
  return updatedConfig;
}

/**
 * Detect existing content collections in the project
 * @param projectRoot Root directory of the project
 * @returns Array of detected content collection names
 */
function detectContentCollections(projectRoot: string): string[] {
  const collections: string[] = [];
  const contentDir = path.join(projectRoot, "src", "content");

  if (fs.existsSync(contentDir)) {
    try {
      const entries = fs.readdirSync(contentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          collections.push(entry.name);
        }
      }
    } catch (error) {
      logger.debug(`Error reading content directory: ${error}`);
    }
  }

  return collections;
}

/**
 * Detect existing registry components in the project
 * @param projectRoot Root directory of the project
 * @returns Array of detected registry component directories
 */
function detectRegistryComponents(projectRoot: string): string[] {
  const components: string[] = [];
  const possibleDirs = [
    path.join(projectRoot, "src", "registry"),
    path.join(projectRoot, "src", "components"),
    path.join(projectRoot, "src", "components", "ui"),
    path.join(projectRoot, "src", "ui"),
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        if (
          entries.some(
            (entry) =>
              entry.isFile() &&
              (entry.name.endsWith(".tsx") ||
                entry.name.endsWith(".jsx") ||
                entry.name.endsWith(".ts") ||
                entry.name.endsWith(".js") ||
                entry.name.endsWith(".astro"))
          )
        ) {
          components.push(dir.replace(projectRoot + path.sep, ""));
        }
      } catch (error) {
        logger.debug(`Error reading directory ${dir}: ${error}`);
      }
    }
  }

  return components;
}
