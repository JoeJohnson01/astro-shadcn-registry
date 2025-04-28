import { describe, it, expect, beforeEach, vi } from "vitest";
import { mergeConfig, validateConfig, defaultConfig } from "../../src/config";
import type { ShadcnRegistryConfig } from "../../src/types";

describe("Config Module", () => {
  describe("mergeConfig", () => {
    it("returns default config when no user config is provided", () => {
      const config = mergeConfig();
      expect(config).toEqual(defaultConfig);
    });

    it("merges user config with default config", () => {
      const userConfig: Partial<ShadcnRegistryConfig> = {
        paths: {
          registry: "custom/registry",
          contentCollection: "custom/content",
          outputRegistry: "custom-registry.json",
        },
        registry: {
          name: "custom-registry",
          homepage: "https://custom-registry.com",
        },
      };

      const config = mergeConfig(userConfig);

      expect(config.paths.registry).toBe("custom/registry");
      expect(config.paths.contentCollection).toBe("custom/content");
      expect(config.paths.outputRegistry).toBe("custom-registry.json");
      expect(config.registry.name).toBe("custom-registry");
      expect(config.registry.homepage).toBe("https://custom-registry.com");

      // Default values should still be present
      expect(config.componentTypes).toEqual(defaultConfig.componentTypes);
      expect(config.preCommitHook).toEqual(defaultConfig.preCommitHook);
    });

    it("merges partial user config without overriding defaults", () => {
      const userConfig: Partial<ShadcnRegistryConfig> = {
        paths: {
          registry: "custom/registry",
          contentCollection: "src/content", // Keep default
          outputRegistry: "registry.json", // Keep default
        },
      };

      const config = mergeConfig(userConfig);

      expect(config.paths.registry).toBe("custom/registry");
      expect(config.paths.contentCollection).toBe("src/content");
      expect(config.paths.outputRegistry).toBe("registry.json");
    });

    it("merges nested config objects correctly", () => {
      // Using type assertion to work around TypeScript limitations
      const userConfig = {
        advanced: {
          defaultLanguage: "vue" as const,
          registryURL: "https://my-custom-registry.com",
        },
      } as Partial<ShadcnRegistryConfig>;

      const config = mergeConfig(userConfig);

      // Using type assertion on the result as well
      const typedConfig = config as any;
      expect(typedConfig.advanced.defaultLanguage).toBe("vue");
      expect(typedConfig.advanced.registryURL).toBe(
        "https://my-custom-registry.com"
      );
    });
  });

  describe("validateConfig", () => {
    let validConfig: ShadcnRegistryConfig;

    beforeEach(() => {
      // Create a valid config for each test
      validConfig = structuredClone(defaultConfig);
    });

    it("validates a correct configuration without throwing", () => {
      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it("throws when registry path is missing", () => {
      const invalidConfig = structuredClone(validConfig);
      // @ts-ignore - Intentionally breaking for test
      invalidConfig.paths.registry = "";

      expect(() => validateConfig(invalidConfig)).toThrow(
        "Registry path is required"
      );
    });

    it("throws when content collection path is missing", () => {
      const invalidConfig = structuredClone(validConfig);
      // @ts-ignore - Intentionally breaking for test
      invalidConfig.paths.contentCollection = "";

      expect(() => validateConfig(invalidConfig)).toThrow(
        "Content collection path is required"
      );
    });

    it("throws when output registry path is missing", () => {
      const invalidConfig = structuredClone(validConfig);
      // @ts-ignore - Intentionally breaking for test
      invalidConfig.paths.outputRegistry = "";

      expect(() => validateConfig(invalidConfig)).toThrow(
        "Output registry path is required"
      );
    });

    it("throws when registry name is missing", () => {
      const invalidConfig = structuredClone(validConfig);
      // @ts-ignore - Intentionally breaking for test
      invalidConfig.registry.name = "";

      expect(() => validateConfig(invalidConfig)).toThrow(
        "Registry name is required"
      );
    });

    it("throws when registry homepage is missing", () => {
      const invalidConfig = structuredClone(validConfig);
      // @ts-ignore - Intentionally breaking for test
      invalidConfig.registry.homepage = "";

      expect(() => validateConfig(invalidConfig)).toThrow(
        "Registry homepage is required"
      );
    });

    it("throws when component types array is empty", () => {
      const invalidConfig = structuredClone(validConfig);
      invalidConfig.componentTypes = [];

      expect(() => validateConfig(invalidConfig)).toThrow(
        "At least one component type is required"
      );
    });
  });
});
