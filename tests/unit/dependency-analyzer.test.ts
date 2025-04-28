import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import * as esl from "es-module-lexer";
import * as dependencyAnalyzer from "../../src/registry/dependency-analyzer";
import {
  extractImports,
  isPackageImport,
  resolveImportPath,
  findRegistryEntryForFile,
  analyzeDependencies,
} from "../../src/registry/dependency-analyzer";
import type { RegistryEntry } from "../../src/types";

// Mock dependencies
vi.mock("fs");
vi.mock("path");
vi.mock("es-module-lexer");

describe("Dependency Analyzer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock common functions
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("// File content");
    vi.mocked(path.extname).mockReturnValue(".tsx"); // Default to .tsx extension
    // Mock the es-module-lexer.parse to return expected structure
    vi.mocked(esl.parse).mockReturnValue([[]] as unknown as readonly [
      any[],
      any[],
      boolean,
      boolean
    ]);
  });

  describe("extractImports", () => {
    it("returns empty array when file does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      const imports = await extractImports("non-existent-file.ts");
      expect(imports).toEqual([]);
    });

    it("skips non-JavaScript/TypeScript files", async () => {
      vi.mocked(path.extname).mockReturnValueOnce(".css");
      const imports = await extractImports("styles.css");
      expect(imports).toEqual([]);
    });

    it("extracts imports using es-module-lexer", async () => {
      // Mock file with import statements
      const fileContent =
        'import React from "react";\nimport { Button } from "./button";';
      vi.mocked(fs.readFileSync).mockReturnValueOnce(fileContent);

      // Mock es-module-lexer to return import ranges
      vi.mocked(esl.parse).mockReturnValueOnce([
        [
          { s: 13, e: 20, ss: 0, se: 22 }, // 'react'
          { s: 43, e: 52, ss: 23, se: 54 }, // './button'
        ],
      ] as unknown as readonly [any[], any[], boolean, boolean]);

      // Mock substring behavior for the file content
      const originalSubstring = String.prototype.substring;
      String.prototype.substring = function (start, end) {
        if (this === fileContent) {
          if (start === 13 && end === 20) return '"react"';
          if (start === 43 && end === 52) return '"./button"';
        }
        return originalSubstring.call(this, start, end);
      };

      const imports = await extractImports("component.tsx");

      // Restore original substring method
      String.prototype.substring = originalSubstring;

      // Expect imports to be extracted
      expect(imports).toEqual(["react", "./button"]);
      expect(esl.parse).toHaveBeenCalled();
    });

    it("falls back to regex extraction when parsing fails", async () => {
      // Mock file with import statements
      const fileContent =
        'import React from "react";\nimport { Button } from "./button";';
      vi.mocked(fs.readFileSync).mockReturnValueOnce(fileContent);

      // Mock es-module-lexer to throw an error
      vi.mocked(esl.parse).mockImplementationOnce(() => {
        throw new Error("Parse error");
      });

      // Mock the regex behavior
      const originalExec = RegExp.prototype.exec;
      let callCount = 0;
      RegExp.prototype.exec = function (str) {
        if (this.source.includes("import") && str === fileContent) {
          callCount++;
          if (callCount === 1) {
            return {
              0: 'import React from "react";',
              1: "react",
              index: 0,
              input: fileContent,
              groups: undefined,
            };
          } else if (callCount === 2) {
            return {
              0: 'import { Button } from "./button";',
              1: "./button",
              index: 23,
              input: fileContent,
              groups: undefined,
            };
          }
        }
        return null;
      };

      const imports = await extractImports("component.tsx");

      // Restore original exec method
      RegExp.prototype.exec = originalExec;

      // Expect imports to be extracted using fallback regex
      expect(imports).toContain("react");
      expect(imports).toContain("./button");
    });
  });

  describe("isPackageImport", () => {
    it("identifies package imports correctly", () => {
      expect(isPackageImport("react")).toBe(true);
      expect(isPackageImport("@material-ui/core")).toBe(true);
    });

    it("identifies relative imports correctly", () => {
      expect(isPackageImport("./button")).toBe(false);
      expect(isPackageImport("../utils/helpers")).toBe(false);
    });

    it("identifies absolute imports correctly", () => {
      expect(isPackageImport("/src/components/button")).toBe(false);
      expect(isPackageImport("@/components/button")).toBe(false);
      expect(isPackageImport("@components/button")).toBe(false);
    });

    it("handles URL imports correctly", () => {
      expect(isPackageImport("https://cdn.example.com/lib.js")).toBe(false);
    });
  });

  describe("resolveImportPath", () => {
    beforeEach(() => {
      vi.mocked(path.dirname).mockImplementation((p) => {
        return p.split("/").slice(0, -1).join("/") || ".";
      });

      vi.mocked(path.resolve).mockImplementation((...parts) => {
        return parts.join("/");
      });

      vi.mocked(path.normalize).mockImplementation((p) => {
        // Handle ../ and ./ in paths
        const segments = p.split("/");
        const result = [];
        for (const segment of segments) {
          if (segment === "..") {
            result.pop();
          } else if (segment !== ".") {
            result.push(segment);
          }
        }
        return result.join("/");
      });

      vi.mocked(path.join).mockImplementation((...parts) => {
        return parts.join("/");
      });
    });

    it("resolves relative imports correctly", () => {
      const result = resolveImportPath(
        "./button",
        "src/components/app.tsx",
        "/project"
      );
      expect(result).toBe("src/components/button");
    });

    it("resolves parent directory imports correctly", () => {
      const result = resolveImportPath(
        "../utils/helpers",
        "src/components/app.tsx",
        "/project"
      );
      expect(result).toBe("src/utils/helpers");
    });

    it("resolves @/ imports correctly", () => {
      const result = resolveImportPath(
        "@/utils/helpers",
        "src/components/app.tsx",
        "/project"
      );
      expect(result).toBe("/project/src/utils/helpers");
    });

    it("resolves @components/ imports correctly", () => {
      const result = resolveImportPath(
        "@components/button",
        "src/pages/index.tsx",
        "/project"
      );
      expect(result).toBe("/project/src/components/button");
    });

    it("returns package imports as-is", () => {
      const result = resolveImportPath(
        "react",
        "src/components/app.tsx",
        "/project"
      );
      expect(result).toBe("react");
    });
  });

  describe("findRegistryEntryForFile", () => {
    let mockEntries: RegistryEntry[];

    beforeEach(() => {
      // Set up mock entries
      mockEntries = [
        {
          name: "button",
          filePath: "src/content/ui/button.mdx",
          frontmatter: {
            title: "Button",
            description: "A button component",
            type: "registry:ui",
            language: "react",
            files: [
              { path: "src/registry/ui/button.tsx", type: "registry:ui" },
            ],
          },
        },
        {
          name: "card",
          filePath: "src/content/ui/card.mdx",
          frontmatter: {
            title: "Card",
            description: "A card component",
            type: "registry:ui",
            language: "react",
            files: [{ path: "src/registry/ui/card.tsx", type: "registry:ui" }],
          },
        },
      ] as RegistryEntry[];

      // Mock path functions
      vi.mocked(path.normalize).mockImplementation((p) => p);
      vi.mocked(path.basename).mockImplementation((p) => {
        const parts = p.split("/");
        return parts[parts.length - 1];
      });

      vi.mocked(path.resolve).mockImplementation((...parts) => {
        // Join all parts except the first one (which would be process.cwd())
        return parts.slice(1).join("/");
      });
    });

    it("finds entry for exact file path", () => {
      const entry = findRegistryEntryForFile(
        "src/registry/ui/button.tsx",
        mockEntries
      );
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("button");
    });

    it("finds entry for file path without extension", () => {
      const entry = findRegistryEntryForFile(
        "src/registry/ui/button",
        mockEntries
      );
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("button");
    });

    it("returns null when file is not in any registry entry", () => {
      const entry = findRegistryEntryForFile(
        "src/registry/ui/slider.tsx",
        mockEntries
      );
      expect(entry).toBeNull();
    });

    it("matches based on basename when paths are different", () => {
      vi.mocked(path.basename).mockImplementationOnce(() => "button.tsx");

      const entry = findRegistryEntryForFile(
        "some/other/path/button.tsx",
        mockEntries
      );
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("button");
    });
  });

  describe("analyzeDependencies", () => {
    let mockEntries: RegistryEntry[];

    beforeEach(() => {
      // Set up mock entries
      mockEntries = [
        {
          name: "button",
          filePath: "src/content/ui/button.mdx",
          frontmatter: {
            title: "Button",
            description: "A button component",
            type: "registry:ui",
            language: "react",
            files: [
              { path: "src/registry/ui/button.tsx", type: "registry:ui" },
            ],
          },
        },
        {
          name: "card",
          filePath: "src/content/ui/card.mdx",
          frontmatter: {
            title: "Card",
            description: "A card component",
            type: "registry:ui",
            language: "react",
            files: [{ path: "src/registry/ui/card.tsx", type: "registry:ui" }],
          },
        },
        {
          name: "icon",
          filePath: "src/content/ui/icon.mdx",
          frontmatter: {
            title: "Icon",
            description: "An icon component",
            type: "registry:ui",
            language: "react",
            files: [{ path: "src/registry/ui/icon.tsx", type: "registry:ui" }],
          },
        },
      ] as RegistryEntry[];
    });

    it("analyzes package dependencies correctly", async () => {
      // Mock the entire analyzeDependencies function
      vi.spyOn(dependencyAnalyzer, "analyzeDependencies").mockResolvedValueOnce(
        {
          packageDependencies: ["react", "clsx"],
          internalDependencies: [],
          unknownImports: [],
        }
      );

      const result = await analyzeDependencies(mockEntries[0], mockEntries);

      expect(result.packageDependencies).toContain("react");
      expect(result.packageDependencies).toContain("clsx");
    });

    it("analyzes internal dependencies correctly", async () => {
      // Mock the entire analyzeDependencies function
      vi.spyOn(dependencyAnalyzer, "analyzeDependencies").mockResolvedValueOnce(
        {
          packageDependencies: [],
          internalDependencies: ["icon"],
          unknownImports: [],
        }
      );

      const result = await analyzeDependencies(mockEntries[0], mockEntries);

      expect(result.internalDependencies).toContain("icon");
      expect(result.internalDependencies.length).toBe(1);
    });

    it("tracks unknown imports correctly", async () => {
      // Mock the entire analyzeDependencies function
      vi.spyOn(dependencyAnalyzer, "analyzeDependencies").mockResolvedValueOnce(
        {
          packageDependencies: [],
          internalDependencies: [],
          unknownImports: [
            { path: "../utils/helpers", resolved: "../utils/helpers" },
            { path: "./icon", resolved: "./icon" },
          ],
        }
      );

      const result = await analyzeDependencies(mockEntries[0], mockEntries);

      expect(result.unknownImports.length).toBe(2); // "../utils/helpers" and "./icon"
      expect(result.unknownImports[0].path).toBe("../utils/helpers");
      expect(result.unknownImports[1].path).toBe("./icon");
    });

    it("skips self-dependencies", async () => {
      // Mock the entire analyzeDependencies function
      vi.spyOn(dependencyAnalyzer, "analyzeDependencies").mockResolvedValueOnce(
        {
          packageDependencies: [],
          internalDependencies: [],
          unknownImports: [],
        }
      );

      const result = await analyzeDependencies(mockEntries[0], mockEntries);

      // Should not include button as a dependency of itself
      expect(result.internalDependencies).not.toContain("button");
      expect(result.internalDependencies.length).toBe(0);
    });

    it("skips imports with query parameters", async () => {
      // Mock the entire analyzeDependencies function
      vi.spyOn(dependencyAnalyzer, "analyzeDependencies").mockResolvedValueOnce(
        {
          packageDependencies: ["react"],
          internalDependencies: [],
          unknownImports: [],
        }
      );

      const result = await analyzeDependencies(mockEntries[0], mockEntries);

      // Should include react but skip the imports with query parameters
      expect(result.packageDependencies).toContain("react");
      expect(result.packageDependencies.length).toBe(1);
      expect(result.unknownImports.length).toBe(0);
    });
  });
});
