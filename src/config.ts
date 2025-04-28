import type { ShadcnRegistryConfig } from "./types";

/**
 * Default configuration for the astro-shadcn-registry integration
 */
export const defaultConfig: ShadcnRegistryConfig = {
  paths: {
    registry: "src/registry",
    contentCollection: "src/content",
    outputRegistry: "registry.json",
  },
  componentTypes: [
    "ui",
    "component",
    "block",
    "hook",
    "lib",
    "page",
    "file",
    "style",
    "theme",
  ],
  registry: {
    name: "my-registry",
    homepage: "https://mycomponents.com",
  },
  preCommitHook: {
    enabled: false,
    paths: ["src/registry/**/*"],
  },
  advanced: {
    defaultLanguage: "react",
    registryURL: "https://mycomponents.com",
    deleteRegistryAfterBuild: true,
  },
};

/**
 * Merge user configuration with default configuration
 * @param userConfig User-provided configuration
 * @returns Merged configuration
 */
export function mergeConfig(
  userConfig: Partial<ShadcnRegistryConfig> = {}
): ShadcnRegistryConfig {
  return {
    paths: {
      ...defaultConfig.paths,
      ...userConfig.paths,
    },
    componentTypes: userConfig.componentTypes || defaultConfig.componentTypes,
    registry: {
      ...defaultConfig.registry,
      ...userConfig.registry,
    },
    preCommitHook: {
      ...defaultConfig.preCommitHook,
      ...userConfig.preCommitHook,
    },
    advanced: {
      ...defaultConfig.advanced,
      ...userConfig.advanced,
    },
  };
}

/**
 * Validate the configuration
 * @param config Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: ShadcnRegistryConfig): void {
  // Validate paths
  if (!config.paths.registry) {
    throw new Error("Registry path is required");
  }
  if (!config.paths.contentCollection) {
    throw new Error("Content collection path is required");
  }
  if (!config.paths.outputRegistry) {
    throw new Error("Output registry path is required");
  }

  // Validate registry metadata
  if (!config.registry.name) {
    throw new Error("Registry name is required");
  }
  if (!config.registry.homepage) {
    throw new Error("Registry homepage is required");
  }

  // Validate component types
  if (!config.componentTypes || config.componentTypes.length === 0) {
    throw new Error("At least one component type is required");
  }
}
