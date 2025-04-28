import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { generateRegistry } from "../../src/registry/generate";
import * as fileUtils from "../../src/registry/file-utils";
import * as dependencyAnalyzer from "../../src/registry/dependency-analyzer";
import inquirer from "inquirer";
import { logger } from "../../src/utils/logger";
import type {
  ShadcnRegistryConfig,
  RegistryEntry,
  Frontmatter,
} from "../../src/types";

// Mock dependencies
vi.mock("fs", async () => {
  return {
    default: {
      existsSync: vi.fn(),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
    },
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

vi.mock("path", async () => {
  return {
    default: {
      dirname: vi
        .fn()
        .mockImplementation((p) => p.split("/").slice(0, -1).join("/")),
      basename: vi.fn().mockImplementation((p) => p.split("/").pop() || ""),
      join: vi.fn().mockImplementation((...args) => args.join("/")),
      relative: vi.fn().mockImplementation((from, to) => to),
    },
    dirname: vi
      .fn()
      .mockImplementation((p) => p.split("/").slice(0, -1).join("/")),
    basename: vi.fn().mockImplementation((p) => p.split("/").pop() || ""),
    join: vi.fn().mockImplementation((...args) => args.join("/")),
    relative: vi.fn().mockImplementation((from, to) => to),
  };
});

vi.mock("../../src/registry/file-utils", () => {
  return {
    findContentFiles: vi
      .fn()
      .mockResolvedValue([
        "src/content/ui/button.mdx",
        "src/content/ui/card.mdx",
        "src/content/ui/input.mdx",
      ]),
    parseRegistryEntries: vi.fn(),
    writeFile: vi.fn(),
    fileExists: vi.fn().mockReturnValue(true),
    readFile: vi.fn().mockReturnValue("file content"),
    ensureDir: vi.fn(),
    updateMdxFile: vi.fn(),
    createMdxFile: vi.fn(),
  };
});
vi.mock("../../src/registry/dependency-analyzer", () => {
  return {
    analyzeDependencies: vi.fn().mockResolvedValue({
      packageDependencies: ["react", "clsx"],
      internalDependencies: [],
      unknownImports: [],
    }),
    isPackageImport: vi.fn().mockReturnValue(true),
    findRegistryEntryForFile: vi.fn(),
    extractImports: vi.fn().mockResolvedValue([]),
    resolveImportPath: vi.fn(),
    setLogger: vi.fn(), // Add the missing setLogger function
  };
});
vi.mock("inquirer", async () => {
  return {
    default: {
      prompt: vi.fn().mockResolvedValue({
        confirmPackage: true,
        confirmInternalDep: true,
        action: "skip",
        fileType: "ui",
        title: "Test Component",
        description: "A test component",
        language: "react",
        categories: "ui",
      }),
    },
  };
});

vi.mock("../../src/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    spinner: vi.fn().mockReturnValue({
      update: vi.fn(),
      complete: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

describe("Registry Generation", () => {
  let mockConfig: ShadcnRegistryConfig;
  let mockRegistryEntries: RegistryEntry[];

  beforeEach(() => {
    vi.resetAllMocks();

    // Set up mock config
    mockConfig = {
      paths: {
        registry: "src/registry",
        contentCollection: "src/content",
        outputRegistry: "registry.json",
      },
      componentTypes: ["ui", "component"],
      registry: {
        name: "test-registry",
        homepage: "https://test-registry.com",
      },
      preCommitHook: {
        enabled: false,
        paths: ["src/registry/**/*"],
      },
      advanced: {
        defaultLanguage: "react",
        registryURL: "https://test-registry.com",
      },
    } as ShadcnRegistryConfig;

    // Set up mock registry entries
    mockRegistryEntries = [
      createMockEntry("button", "ui"),
      createMockEntry("card", "ui"),
      createMockEntry("input", "ui"),
    ];

    // Mock process.cwd()
    vi.spyOn(process, "cwd").mockReturnValue("/project");

    // Set up mock return values
    fileUtils.parseRegistryEntries.mockReturnValue(mockRegistryEntries);

    // Mock path.join to return expected output path
    path.join.mockImplementation((...args) => {
      if (args[0] === "/project" && args[1] === "registry.json") {
        return "/project/registry.json";
      }
      return args.join("/");
    });

    // Mock dependency analyzer for internal dependencies test
    dependencyAnalyzer.analyzeDependencies.mockImplementation((entry) => {
      if (
        entry.name === "button" &&
        mockRegistryEntries[0].frontmatter.internalRegistryDependencies?.includes(
          "card"
        )
      ) {
        return Promise.resolve({
          packageDependencies: ["react"],
          internalDependencies: ["card"],
          unknownImports: [],
        });
      }
      return Promise.resolve({
        packageDependencies: ["react", "clsx"],
        internalDependencies: [],
        unknownImports: [],
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMockEntry(name: string, type: string): RegistryEntry {
    return {
      name,
      filePath: `src/content/${type}/${name}.mdx`,
      frontmatter: {
        title: name.charAt(0).toUpperCase() + name.slice(1),
        description: `A ${name} component`,
        type: `registry:${type}`,
        language: "react",
        files: [
          {
            path: `src/registry/${type}/${name}.tsx`,
            type: `registry:${type}`,
          },
        ],
        dependencies: [],
        shadcnRegistryDependencies: [],
        internalRegistryDependencies: [],
        otherRegistryDependencies: [],
      } as Frontmatter,
    };
  }

  it("generates a valid registry file with all components", async () => {
    // Execute the registry generation
    const outPath = await generateRegistry(mockConfig, logger);

    // Check that the output path is correct
    expect(outPath).toBe("/project/registry.json");

    // Verify content files were found
    expect(fileUtils.findContentFiles).toHaveBeenCalledWith("src/content", [
      "ui",
      "component",
    ]);

    // Verify registry entries were parsed
    expect(fileUtils.parseRegistryEntries).toHaveBeenCalled();

    // Verify dependencies were analyzed
    expect(dependencyAnalyzer.analyzeDependencies).toHaveBeenCalledTimes(3);

    // Verify the registry file was written
    expect(fileUtils.writeFile).toHaveBeenCalledWith(
      "/project/registry.json",
      expect.any(String)
    );

    // Parse the written registry content and verify structure
    const writeCall = vi.mocked(fileUtils.writeFile).mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    // Verify registry structure
    expect(registry.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
    expect(registry.name).toBe("test-registry");
    expect(registry.homepage).toBe("https://test-registry.com");
    expect(registry.items).toHaveLength(3);

    // Verify each component is in the registry
    const componentNames = registry.items.map((item: any) => item.name);
    expect(componentNames).toContain("button");
    expect(componentNames).toContain("card");
    expect(componentNames).toContain("input");

    // Verify component structure
    const buttonComponent = registry.items.find(
      (item: any) => item.name === "button"
    );
    expect(buttonComponent).toMatchObject({
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "A button component",
      files: [{ path: "src/registry/ui/button.tsx", type: "registry:ui" }],
      registryDependencies: [],
    });

    // Verify the link to the documentation
    expect(buttonComponent?.docs).toBe("https://test-registry.com/button");
  });

  it("handles internal dependencies correctly", async () => {
    // Add internal registry dependencies to the button component
    mockRegistryEntries[0].frontmatter.internalRegistryDependencies = ["card"];

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Parse the written registry content
    const writeCall = fileUtils.writeFile.mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    // Find the component with internal dependencies
    const component = registry.items.find(
      (item: any) => item.name === "button"
    );

    // Verify the internal dependency is correctly included in registryDependencies
    expect(component?.registryDependencies).toContain("card");
  });

  it("handles shadcn registry dependencies correctly", async () => {
    // Add shadcn registry dependencies to a component
    mockRegistryEntries[0].frontmatter.shadcnRegistryDependencies = ["dialog"];

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Parse the written registry content
    const writeCall = vi.mocked(fileUtils.writeFile).mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    // Find the component with shadcn dependencies
    const component = registry.items.find(
      (item: any) => item.name === "button"
    );

    // Verify the shadcn dependency is correctly included in registryDependencies
    expect(component?.registryDependencies).toContain("dialog");
  });

  it("handles other registry dependencies correctly", async () => {
    // Add other registry dependencies to a component
    mockRegistryEntries[0].frontmatter.otherRegistryDependencies = [
      "https://external.com/component",
    ];

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Parse the written registry content
    const writeCall = vi.mocked(fileUtils.writeFile).mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    // Find the component with other dependencies
    const component = registry.items.find(
      (item: any) => item.name === "button"
    );

    // Verify the other dependency is correctly included in registryDependencies
    expect(component?.registryDependencies).toContain(
      "https://external.com/component"
    );
  });

  it("validates component types", async () => {
    // Mock the implementation to throw an error for invalid component type
    fileUtils.parseRegistryEntries.mockImplementation(() => {
      throw new Error(
        "Invalid component type 'registry:invalid' in invalid. Must be one of: ui, component"
      );
    });

    // Execute and expect error for invalid component type
    await expect(generateRegistry(mockConfig, logger)).rejects.toThrow(
      /Invalid component type/
    );
  });

  it("handles errors during generation", async () => {
    // Mock findContentFiles to throw an error
    fileUtils.findContentFiles.mockRejectedValue(new Error("Test error"));

    // Execute and expect error
    await expect(generateRegistry(mockConfig, logger)).rejects.toThrow(
      "Test error"
    );

    // Verify error was logged
    expect(logger.error).toHaveBeenCalled();
  });

  it("handles empty registry entries", async () => {
    // Mock empty registry entries
    fileUtils.parseRegistryEntries.mockReturnValue([]);

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Verify the registry file was written with empty items
    const writeCall = fileUtils.writeFile.mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    expect(registry.items).toEqual([]);
  });

  it("handles registry entries with no files", async () => {
    // Create a registry entry with no files
    const entryWithNoFiles = {
      name: "nofiles",
      filePath: "src/content/ui/nofiles.mdx",
      frontmatter: {
        title: "No Files",
        description: "A component with no files",
        type: "registry:ui",
        language: "react",
        files: [],
      } as Frontmatter,
    };

    // Mock registry entries
    fileUtils.parseRegistryEntries.mockReturnValue([entryWithNoFiles]);

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Verify the registry file was written with the entry
    const writeCall = fileUtils.writeFile.mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    const nofilesComponent = registry.items.find(
      (item: any) => item.name === "nofiles"
    );
    expect(nofilesComponent).toBeDefined();
    expect(nofilesComponent?.files).toEqual([]);
  });

  it("handles registry entries with custom author", async () => {
    // Create a registry entry with custom author
    const entryWithAuthor = {
      name: "custom",
      filePath: "src/content/ui/custom.mdx",
      frontmatter: {
        title: "Custom",
        description: "A component with custom author",
        type: "registry:ui",
        language: "react",
        files: [{ path: "src/registry/ui/custom.tsx", type: "registry:ui" }],
        author: "John Doe <john@example.com>",
      } as Frontmatter,
    };

    // Mock registry entries
    fileUtils.parseRegistryEntries.mockReturnValue([entryWithAuthor]);

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Verify the registry file was written with the custom author
    const writeCall = fileUtils.writeFile.mock.calls[0];
    const writtenContent = writeCall[1];
    const registry = JSON.parse(writtenContent);

    const customComponent = registry.items.find(
      (item: any) => item.name === "custom"
    );
    expect(customComponent).toBeDefined();
    expect(customComponent?.author).toBe("John Doe <john@example.com>");
  });
});
