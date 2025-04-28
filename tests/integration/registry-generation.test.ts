import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { generateRegistry } from "../../src/registry/generate";
import * as fileUtils from "../../src/registry/file-utils";
import * as dependencyAnalyzer from "../../src/registry/dependency-analyzer";
import { logger } from "../../src/utils/logger";
import type {
  ShadcnRegistryConfig,
  Registry,
  Frontmatter,
} from "../../src/types";

// Mock dependencies
vi.mock("fs");
vi.mock("path");
vi.mock("inquirer", async () => {
  return {
    default: {
      prompt: vi.fn().mockImplementation((questions) => {
        // Create a response object with default values for each question
        const response: Record<string, any> = {};

        // Handle array of questions
        if (Array.isArray(questions)) {
          questions.forEach((q) => {
            if (
              q.name === "confirmPackage" ||
              q.name === "confirmInternalDep"
            ) {
              response[q.name] = true;
            } else if (q.name === "action") {
              response[q.name] = "skip";
            } else if (q.name === "depType") {
              response[q.name] = "skip";
            } else if (q.type === "list" || q.type === "input") {
              response[q.name] = q.default || "";
            } else {
              response[q.name] = true; // Default for confirm questions
            }
          });
        } else {
          // Handle single question
          const q = questions;
          if (q.type === "list" || q.type === "input") {
            response[q.name] = q.default || "";
          } else {
            response[q.name] = true; // Default for confirm questions
          }
        }

        return Promise.resolve(response);
      }),
    },
    prompt: vi.fn().mockImplementation((questions) => {
      // Create a response object with default values for each question
      const response: Record<string, any> = {};

      // Handle array of questions
      if (Array.isArray(questions)) {
        questions.forEach((q) => {
          if (q.name === "confirmPackage" || q.name === "confirmInternalDep") {
            response[q.name] = true;
          } else if (q.name === "action") {
            response[q.name] = "skip";
          } else if (q.name === "depType") {
            response[q.name] = "skip";
          } else if (q.type === "list" || q.type === "input") {
            response[q.name] = q.default || "";
          } else {
            response[q.name] = true; // Default for confirm questions
          }
        });
      } else {
        // Handle single question
        const q = questions;
        if (q.type === "list" || q.type === "input") {
          response[q.name] = q.default || "";
        } else {
          response[q.name] = true; // Default for confirm questions
        }
      }

      return Promise.resolve(response);
    }),
  };
});
vi.mock("../../src/registry/file-utils");
vi.mock("../../src/registry/dependency-analyzer");
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

describe("Registry Generation Integration", () => {
  let mockConfig: ShadcnRegistryConfig;
  let mockComponentFiles: string[];
  let mockContentFiles: string[];

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

    // Set up mock component files
    mockComponentFiles = [
      "src/registry/ui/button.tsx",
      "src/registry/ui/card.tsx",
      "src/registry/ui/input.tsx",
    ];

    // Set up mock content files
    mockContentFiles = [
      "src/content/ui/button.mdx",
      "src/content/ui/card.mdx",
      "src/content/ui/input.mdx",
    ];

    // Mock path functions
    vi.mocked(path.join).mockImplementation((...parts) => parts.join("/"));
    vi.mocked(path.resolve).mockImplementation((...parts) => parts.join("/"));
    vi.mocked(path.basename).mockImplementation(
      (p) => p.split("/").pop() || ""
    );
    vi.mocked(path.dirname).mockImplementation((p) =>
      p.split("/").slice(0, -1).join("/")
    );

    // Mock file utilities
    vi.mocked(fileUtils.fileExists).mockReturnValue(true);
    vi.mocked(fileUtils.writeFile).mockImplementation(() => {});
    vi.mocked(fileUtils.findContentFiles).mockResolvedValue(mockContentFiles);

    // Mock registry entry data
    const createMockEntry = (name: string) => ({
      name,
      filePath: `src/content/ui/${name}.mdx`,
      frontmatter: {
        title: name.charAt(0).toUpperCase() + name.slice(1),
        description: `A ${name} component`,
        type: "registry:ui",
        language: "react",
        files: [
          {
            path: `src/registry/ui/${name}.tsx`,
            type: "registry:ui",
          },
        ],
        dependencies: ["react", "clsx"],
      } as Frontmatter,
    });

    // Mock registry entries
    vi.mocked(fileUtils.parseRegistryEntries).mockReturnValue([
      createMockEntry("button"),
      createMockEntry("card"),
      createMockEntry("input"),
    ]);

    // Mock dependency analysis
    vi.mocked(dependencyAnalyzer.analyzeDependencies).mockResolvedValue({
      packageDependencies: ["react", "clsx"],
      internalDependencies: [],
      unknownImports: [],
    });

    // Mock fs.writeFileSync for the final registry.json
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    // Mock process.cwd()
    vi.spyOn(process, "cwd").mockReturnValue("/project");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(fileUtils.parseRegistryEntries).toHaveBeenCalledWith(
      mockContentFiles
    );

    // Verify dependencies were analyzed for each entry
    expect(dependencyAnalyzer.analyzeDependencies).toHaveBeenCalledTimes(3);

    // Verify the registry file was written
    expect(fileUtils.writeFile).toHaveBeenCalledTimes(1);
    expect(fileUtils.writeFile).toHaveBeenCalledWith(
      "/project/registry.json",
      expect.any(String)
    );

    // Parse the written registry content and verify structure
    const writeCall = vi.mocked(fileUtils.writeFile).mock.calls[0];
    const writtenContent = writeCall[1];
    const registry: Registry = JSON.parse(writtenContent);

    // Verify registry structure
    expect(registry.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
    expect(registry.name).toBe("test-registry");
    expect(registry.homepage).toBe("https://test-registry.com");
    expect(registry.items).toHaveLength(3);

    // Verify each component is in the registry
    const componentNames = registry.items.map((item) => item.name);
    expect(componentNames).toContain("button");
    expect(componentNames).toContain("card");
    expect(componentNames).toContain("input");

    // Verify component structure
    const buttonComponent = registry.items.find(
      (item) => item.name === "button"
    );
    expect(buttonComponent).toMatchObject({
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "A button component",
      files: [{ path: "src/registry/ui/button.tsx", type: "registry:ui" }],
      dependencies: ["react", "clsx"],
      registryDependencies: [],
    });

    // Verify the link to the documentation
    expect(buttonComponent?.docs).toBe("https://test-registry.com/button");
  });

  it("handles components with internal dependencies", async () => {
    // Mock a component with internal dependencies
    vi.mocked(dependencyAnalyzer.analyzeDependencies).mockResolvedValueOnce({
      packageDependencies: ["react"],
      internalDependencies: ["card"],
      unknownImports: [],
    });

    // Mock the registry entries to include internalRegistryDependencies
    const mockEntryWithDeps = {
      name: "button",
      filePath: "src/content/ui/button.mdx",
      frontmatter: {
        title: "Button",
        description: "A button component",
        type: "registry:ui",
        language: "react",
        files: [
          {
            path: "src/registry/ui/button.tsx",
            type: "registry:ui",
          },
        ],
        dependencies: ["react", "clsx"],
        internalRegistryDependencies: ["card"],
      } as Frontmatter,
    };

    // Override the mock for this test
    vi.mocked(fileUtils.parseRegistryEntries).mockReturnValueOnce([
      mockEntryWithDeps,
      {
        name: "card",
        filePath: "src/content/ui/card.mdx",
        frontmatter: {
          title: "Card",
          description: "A card component",
          type: "registry:ui",
          language: "react",
          files: [
            {
              path: "src/registry/ui/card.tsx",
              type: "registry:ui",
            },
          ],
          dependencies: ["react", "clsx"],
        } as Frontmatter,
      },
      {
        name: "input",
        filePath: "src/content/ui/input.mdx",
        frontmatter: {
          title: "Input",
          description: "An input component",
          type: "registry:ui",
          language: "react",
          files: [
            {
              path: "src/registry/ui/input.tsx",
              type: "registry:ui",
            },
          ],
          dependencies: ["react", "clsx"],
        } as Frontmatter,
      },
    ]);

    // Execute the registry generation
    await generateRegistry(mockConfig, logger);

    // Parse the written registry content
    const writeCall = vi.mocked(fileUtils.writeFile).mock.calls[0];
    const writtenContent = writeCall[1];
    const registry: Registry = JSON.parse(writtenContent);

    // Find the component with internal dependencies
    const component = registry.items.find((item) => item.name === "button");

    // Verify the internal dependency is correctly included in registryDependencies
    expect(component?.registryDependencies).toContain("card");
  });

  it("handles errors during registry generation", async () => {
    // Mock findContentFiles to throw an error
    vi.mocked(fileUtils.findContentFiles).mockRejectedValueOnce(
      new Error("Failed to find content files")
    );

    // Execute and expect error
    await expect(generateRegistry(mockConfig, logger)).rejects.toThrow(
      "Failed to find content files"
    );
  });

  it("validates component types", async () => {
    // Mock a component with an invalid type
    const mockInvalidEntry = {
      name: "invalid",
      filePath: "src/content/invalid/component.mdx",
      frontmatter: {
        title: "Invalid",
        description: "An invalid component",
        type: "registry:invalid", // Not in componentTypes
        language: "react",
        files: [
          {
            path: "src/registry/invalid/component.tsx",
            type: "registry:invalid",
          },
        ],
      } as Frontmatter,
    };

    vi.mocked(fileUtils.parseRegistryEntries).mockReturnValue([
      mockInvalidEntry,
    ]);

    // Execute and expect error for invalid component type
    await expect(generateRegistry(mockConfig, logger)).rejects.toThrow(
      /Invalid component type/
    );
  });

  it("validates internal dependencies exist", async () => {
    // Set NODE_ENV to test to trigger the error
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    // Mock an entry with a non-existent internal dependency
    const mockEntryWithNonExistentDep = {
      name: "button",
      filePath: "src/content/ui/button.mdx",
      frontmatter: {
        title: "Button",
        description: "A button component",
        type: "registry:ui",
        language: "react",
        files: [
          {
            path: "src/registry/ui/button.tsx",
            type: "registry:ui",
          },
        ],
        dependencies: ["react", "clsx"],
        internalRegistryDependencies: ["non-existent-component"],
      } as Frontmatter,
    };

    // Override the mock for this test
    vi.mocked(fileUtils.parseRegistryEntries).mockReturnValueOnce([
      mockEntryWithNonExistentDep,
    ]);

    // Execute and expect error for invalid dependency
    await expect(generateRegistry(mockConfig, logger)).rejects.toThrow(
      /depends on internal component.*but no such component exists/
    );

    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});
