import { afterEach, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import * as esl from "es-module-lexer";

// Create mock functions
const mockExistsSync = vi.fn().mockReturnValue(false);
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockMkdirSync = vi.fn();

// Mock the fs module to prevent actual file system operations during tests
vi.mock("fs", async () => {
  const actualFs = await vi.importActual("fs");
  return {
    ...actualFs,
    mkdirSync: mockMkdirSync,
    writeFileSync: mockWriteFileSync,
    readFileSync: mockReadFileSync,
    existsSync: mockExistsSync,
  };
});

// Mock the path module
vi.mock("path", async () => {
  const actualPath = await vi.importActual("path");
  return {
    ...actualPath,
    resolve: vi.fn().mockImplementation((...args) => args.join("/")),
    join: vi.fn().mockImplementation((...args) => args.join("/")),
    dirname: vi
      .fn()
      .mockImplementation((p) => p.split("/").slice(0, -1).join("/")),
    basename: vi.fn().mockImplementation((p) => p.split("/").pop()),
  };
});

// Mock the es-module-lexer
vi.mock("es-module-lexer", async () => {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    parse: vi.fn().mockReturnValue([[]]),
  };
});

// Mock inquirer
vi.mock("inquirer", async () => {
  return {
    default: {
      prompt: vi.fn().mockResolvedValue({}),
    },
  };
});

// Mock fast-glob
vi.mock("fast-glob", async () => {
  return {
    default: vi.fn().mockResolvedValue([]),
  };
});

// Create test fixture directory structure
export function createTestFixtures() {
  // Create a virtual file system for testing
  const mockFiles = {
    "src/registry/ui/button.tsx":
      "export function Button() { return <button>Click me</button>; }",
    "src/content/ui/button.mdx": `---
title: Button
description: A button component with different variants.
type: registry:ui
language: react
files:
  - path: src/registry/ui/button.tsx
    type: registry:ui
---

# Button Component
`,
    "registry.json": "{}",
  };

  // Reset mocks before creating test fixtures
  mockExistsSync.mockImplementation((path) => !!mockFiles[path as string]);

  mockReadFileSync.mockImplementation((path) => {
    const filePath = path.toString();
    if (mockFiles[filePath]) {
      return mockFiles[filePath];
    }
    throw new Error(`File not found: ${filePath}`);
  });

  return mockFiles;
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  createTestFixtures();
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});
