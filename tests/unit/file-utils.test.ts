import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  fileExists,
  ensureDir,
  readFile,
  writeFile,
  findContentFiles,
  parseRegistryEntries,
  updateMdxFile,
  createMdxFile,
} from "../../src/registry/file-utils";
import fg from "fast-glob";
import matter from "gray-matter";
import type { Frontmatter } from "../../src/types";
import { logger } from "../../src/utils/logger";

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

vi.mock("fast-glob", async () => {
  return {
    default: vi.fn().mockResolvedValue([]),
  };
});

vi.mock("../../src/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock gray-matter
vi.mock("gray-matter", () => {
  // Create a complete mock object that matches the GrayMatterFile interface
  const mockResult = {
    data: {
      title: "Test",
      description: "Test description",
      type: "registry:ui",
      language: "react",
      files: [{ path: "test/path.tsx", type: "registry:ui" }],
    },
    content: "# Content",
    // Add required properties from GrayMatterFile interface
    orig: "original content",
    language: "markdown",
    matter: "frontmatter",
    stringify: vi.fn(),
  };

  // Create a stringify mock function
  const mockStringify = vi
    .fn()
    .mockReturnValue("---\nfrontmatter\n---\ncontent");

  // Create the mock function that returns this object
  const mockFn = vi.fn().mockReturnValue(mockResult);

  // Add stringify method to the mock function
  mockFn.stringify = mockStringify;

  // Return the mock implementation
  return {
    default: mockFn,
    stringify: mockStringify,
  };
});

describe("File Utilities", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Setup common mocks
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue("file content");
    path.dirname.mockImplementation((p) => p.split("/").slice(0, -1).join("/"));
    path.basename.mockImplementation((p) => p.split("/").pop() || "");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fileExists", () => {
    it("returns true when file exists", () => {
      fs.existsSync.mockReturnValueOnce(true);
      expect(fileExists("existing-file.txt")).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith("existing-file.txt");
    });

    it("returns false when file does not exist", () => {
      fs.existsSync.mockReturnValueOnce(false);
      expect(fileExists("non-existing-file.txt")).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith("non-existing-file.txt");
    });
  });

  describe("ensureDir", () => {
    it("creates directory if it does not exist", () => {
      fs.existsSync.mockReturnValueOnce(false);
      ensureDir("new-directory");
      expect(fs.mkdirSync).toHaveBeenCalledWith("new-directory", {
        recursive: true,
      });
    });

    it("does not create directory if it already exists", () => {
      fs.existsSync.mockReturnValueOnce(true);
      ensureDir("existing-directory");
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe("readFile", () => {
    it("reads file content", () => {
      fs.readFileSync.mockReturnValueOnce("test content");
      const content = readFile("test-file.txt");
      expect(content).toBe("test content");
      expect(fs.readFileSync).toHaveBeenCalledWith("test-file.txt", "utf-8");
    });
  });

  describe("writeFile", () => {
    it("ensures directory exists before writing file", () => {
      writeFile("path/to/file.txt", "content");
      expect(fs.mkdirSync).toHaveBeenCalledWith("path/to", { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "path/to/file.txt",
        "content",
        "utf-8"
      );
    });
  });

  describe("findContentFiles", () => {
    it("returns files matching the component types", async () => {
      vi.mocked(fg).mockResolvedValue(["file1.mdx", "file2.mdx"]);

      const contentPath = "src/content";
      const componentTypes = ["ui", "component"];

      const files = await findContentFiles(contentPath, componentTypes);

      expect(fg).toHaveBeenCalledWith(
        ["src/content/ui/*.{md,mdx}", "src/content/components/*.{md,mdx}"],
        { absolute: true }
      );

      expect(files).toEqual(["file1.mdx", "file2.mdx"]);
    });

    it("handles multiple component types correctly", async () => {
      vi.mocked(fg).mockResolvedValue(["file1.mdx", "file2.mdx", "file3.mdx"]);

      const contentPath = "src/content";
      const componentTypes = ["ui", "component", "hook", "lib"];

      const files = await findContentFiles(contentPath, componentTypes);

      expect(fg).toHaveBeenCalledWith(
        [
          "src/content/ui/*.{md,mdx}",
          "src/content/components/*.{md,mdx}",
          "src/content/hooks/*.{md,mdx}",
          "src/content/libs/*.{md,mdx}",
        ],
        { absolute: true }
      );

      expect(files).toEqual(["file1.mdx", "file2.mdx", "file3.mdx"]);
    });
  });

  describe("parseRegistryEntries", () => {
    it("parses MDX files into registry entries", () => {
      // Mock fileExists to return true for test files
      fs.existsSync.mockReturnValue(true);

      // Mock readFile and gray-matter
      fs.readFileSync.mockImplementation(() => "file content");

      // Set implementation for this specific test
      vi.mocked(matter).mockReturnValue({
        data: {
          title: "Button",
          description: "A button component",
          type: "registry:ui",
          language: "react",
          files: [{ path: "src/registry/ui/button.tsx", type: "registry:ui" }],
        },
        content: "# Button Component",
        orig: "original content",
        language: "markdown",
        matter: "frontmatter",
        stringify: vi.fn(),
      } as any);

      const filePaths = [
        "src/content/ui/button.mdx",
        "src/content/components/card.mdx",
      ];
      const entries = parseRegistryEntries(filePaths);

      expect(entries).toHaveLength(2);
      expect(entries[0].name).toBe("button");
      expect(entries[0].filePath).toBe("src/content/ui/button.mdx");
      expect(entries[0].frontmatter.title).toBe("Button");
      expect(entries[0].frontmatter.files[0].path).toBe(
        "src/registry/ui/button.tsx"
      );
    });

    it("handles errors when parsing files", () => {
      // Mock fileExists to return true for test files
      fs.existsSync.mockReturnValue(true);

      // Mock readFile to throw error for one file
      fs.readFileSync.mockImplementation((path) => {
        if (path === "src/content/ui/error.mdx") {
          throw new Error("File read error");
        }
        return "file content";
      });

      // Set implementation for this specific test
      vi.mocked(matter).mockReturnValue({
        data: {
          title: "Button",
          description: "A button component",
          type: "registry:ui",
          language: "react",
          files: [{ path: "src/registry/ui/button.tsx", type: "registry:ui" }],
        },
        content: "# Button Component",
        orig: "original content",
        language: "markdown",
        matter: "frontmatter",
        stringify: vi.fn(),
      } as any);

      const filePaths = [
        "src/content/ui/button.mdx",
        "src/content/ui/error.mdx",
      ];
      const entries = parseRegistryEntries(filePaths);

      // Should return only the successful parse
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe("button");
    });

    it("handles non-existent files", () => {
      // Mock fileExists to return false for one file
      fs.existsSync.mockImplementation((path) => {
        return path !== "src/content/ui/nonexistent.mdx";
      });

      // Set implementation for this specific test
      vi.mocked(matter).mockReturnValue({
        data: {
          title: "Button",
          description: "A button component",
          type: "registry:ui",
          language: "react",
          files: [{ path: "src/registry/ui/button.tsx", type: "registry:ui" }],
        },
        content: "# Button Component",
        orig: "original content",
        language: "markdown",
        matter: "frontmatter",
        stringify: vi.fn(),
      } as any);

      const filePaths = [
        "src/content/ui/button.mdx",
        "src/content/ui/nonexistent.mdx",
      ];
      const entries = parseRegistryEntries(filePaths);

      // Should return only the existing file
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe("button");
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("File does not exist")
      );
    });

    it("handles test environment errors differently", () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      // Mock fileExists to return true
      fs.existsSync.mockReturnValue(true);

      // Mock readFile to throw error
      fs.readFileSync.mockImplementation(() => {
        throw new Error("Test error");
      });

      const filePaths = ["src/content/ui/error.mdx"];
      const entries = parseRegistryEntries(filePaths);

      // Should return empty array
      expect(entries).toHaveLength(0);
      expect(logger.debug).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe("updateMdxFile", () => {
    it("updates frontmatter in MDX file", () => {
      // Mock implementations
      const mockMdxContent = "# Content";
      fs.readFileSync.mockReturnValueOnce("existing content");

      // Set implementation for this specific test
      vi.mocked(matter).mockReturnValue({
        data: {
          title: "Original Title",
          description: "Description",
          dependencies: ["dep1"],
        },
        content: mockMdxContent,
        orig: "original content",
        language: "markdown",
        matter: "frontmatter",
        stringify: vi.fn(),
      } as any);

      // Mock the stringify function directly
      const mockStringifyFn = vi.fn((content, data) => {
        return `---\n${JSON.stringify(data)}\n---\n${content}`;
      });

      // Replace the original stringify with our mock
      const originalStringify = matter.stringify;
      matter.stringify = mockStringifyFn;

      updateMdxFile("file.mdx", {
        title: "New Title",
        dependencies: ["dep2"],
      });

      // Check that stringify was called with merged frontmatter
      expect(mockStringifyFn).toHaveBeenCalledWith(
        mockMdxContent,
        expect.objectContaining({
          title: "New Title",
          description: "Description",
          dependencies: ["dep1", "dep2"],
        })
      );

      // Check that file was written
      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore the original stringify
      matter.stringify = originalStringify;
    });
  });

  describe("createMdxFile", () => {
    it("creates a new MDX file with frontmatter", () => {
      // Mock implementations
      const mockStringifyFn = vi
        .fn()
        .mockReturnValue("---\nfrontmatter\n---\ncontent");

      // Replace the original stringify with our mock
      const originalStringify = matter.stringify;
      matter.stringify = mockStringifyFn;

      createMdxFile(
        "new-file.mdx",
        {
          title: "New Component",
          description: "A new component",
        },
        "# New Component"
      );

      // Restore the original stringify
      matter.stringify = originalStringify;

      // Check that stringify was called with correct arguments
      expect(mockStringifyFn).toHaveBeenCalledWith("# New Component", {
        title: "New Component",
        description: "A new component",
      });

      // Check that file was written
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "new-file.mdx",
        "---\nfrontmatter\n---\ncontent",
        "utf-8"
      );
    });
  });
});
