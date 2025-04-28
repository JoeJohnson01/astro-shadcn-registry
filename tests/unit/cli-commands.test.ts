import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  setupCommand,
  generateCommand,
  validateCommand,
  installHookCommand,
  uninstallHookCommand,
  registerCommands,
} from "../../src/cli/commands";
import * as setup from "../../src/cli/setup";
import * as generate from "../../src/registry/generate";
import * as validate from "../../src/cli/validate";
import * as preCommit from "../../src/cli/pre-commit";
import type { ShadcnRegistryConfig } from "../../src/types";

// Mock dependencies
vi.mock("../../src/cli/setup");
vi.mock("../../src/registry/generate");
vi.mock("../../src/cli/validate");
vi.mock("../../src/cli/pre-commit");
vi.mock("../../src/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("CLI Commands", () => {
  let mockConfig: ShadcnRegistryConfig;
  let mockCli: any;
  let processExitSpy: any;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Mock process.exit
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    // Create mock config
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
      advanced: {
        defaultLanguage: "react",
        registryURL: "https://test-registry.com",
      },
    } as ShadcnRegistryConfig;

    // Create mock CLI
    mockCli = {
      createCommand: vi.fn().mockReturnThis(),
      describe: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    };

    // Mock successful implementations
    vi.mocked(setup.setup).mockResolvedValue(mockConfig);
    vi.mocked(generate.generateRegistry).mockResolvedValue(
      "/path/to/registry.json"
    );
    vi.mocked(validate.validateRegistry).mockResolvedValue();
    vi.mocked(preCommit.installPreCommitHook).mockReturnValue(true);
    vi.mocked(preCommit.uninstallPreCommitHook).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("setupCommand", () => {
    it("calls setup with the provided config", async () => {
      await setupCommand(mockConfig);
      expect(setup.setup).toHaveBeenCalledWith(mockConfig);
    });

    it("handles errors and exits with code 1", async () => {
      const error = new Error("Setup failed");
      vi.mocked(setup.setup).mockRejectedValueOnce(error);

      await setupCommand(mockConfig);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("generateCommand", () => {
    it("calls generateRegistry with the provided config and logger", async () => {
      await generateCommand(mockConfig);
      // Check that generateRegistry is called with the config and any logger
      expect(generate.generateRegistry).toHaveBeenCalledWith(
        mockConfig,
        expect.anything()
      );
    });

    it("handles errors and exits with code 1", async () => {
      const error = new Error("Generate failed");
      vi.mocked(generate.generateRegistry).mockRejectedValueOnce(error);

      await generateCommand(mockConfig);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("validateCommand", () => {
    it("calls validateRegistry with the provided config", async () => {
      await validateCommand(mockConfig);
      expect(validate.validateRegistry).toHaveBeenCalledWith(mockConfig);
    });

    it("handles errors and exits with code 1", async () => {
      const error = new Error("Validation failed");
      vi.mocked(validate.validateRegistry).mockRejectedValueOnce(error);

      await validateCommand(mockConfig);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("installHookCommand", () => {
    it("calls installPreCommitHook with the provided config", () => {
      installHookCommand(mockConfig);
      expect(preCommit.installPreCommitHook).toHaveBeenCalledWith(mockConfig);
    });

    it("handles failure and exits with code 1", () => {
      vi.mocked(preCommit.installPreCommitHook).mockReturnValueOnce(false);
      installHookCommand(mockConfig);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("handles errors and exits with code 1", () => {
      const error = new Error("Install hook failed");
      vi.mocked(preCommit.installPreCommitHook).mockImplementationOnce(() => {
        throw error;
      });

      installHookCommand(mockConfig);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("uninstallHookCommand", () => {
    it("calls uninstallPreCommitHook", () => {
      uninstallHookCommand();
      expect(preCommit.uninstallPreCommitHook).toHaveBeenCalled();
    });

    it("handles failure and exits with code 1", () => {
      vi.mocked(preCommit.uninstallPreCommitHook).mockReturnValueOnce(false);
      uninstallHookCommand();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("handles errors and exits with code 1", () => {
      const error = new Error("Uninstall hook failed");
      vi.mocked(preCommit.uninstallPreCommitHook).mockImplementationOnce(() => {
        throw error;
      });

      uninstallHookCommand();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("registerCommands", () => {
    it("registers all commands with the CLI", () => {
      registerCommands(mockCli, mockConfig);

      // Verify each command was registered
      expect(mockCli.createCommand).toHaveBeenCalledWith("registry:generate");
      expect(mockCli.createCommand).toHaveBeenCalledWith("registry:setup");
      expect(mockCli.createCommand).toHaveBeenCalledWith("registry:validate");
      expect(mockCli.createCommand).toHaveBeenCalledWith(
        "registry:install-hook"
      );
      expect(mockCli.createCommand).toHaveBeenCalledWith(
        "registry:uninstall-hook"
      );

      // Verify each command has a description
      expect(mockCli.describe).toHaveBeenCalledTimes(5);

      // Verify each command has an action
      expect(mockCli.action).toHaveBeenCalledTimes(5);
    });

    it("registers action callbacks for each command", () => {
      registerCommands(mockCli, mockConfig);

      // Verify each command has an action callback
      expect(mockCli.action).toHaveBeenCalledTimes(5);

      // We can't easily test the callbacks directly since they call process.exit
      // Instead, we'll verify that the action method was called for each command
      const commandTypes = [
        "registry:generate",
        "registry:setup",
        "registry:validate",
        "registry:install-hook",
        "registry:uninstall-hook",
      ];

      commandTypes.forEach((cmdType) => {
        expect(mockCli.createCommand).toHaveBeenCalledWith(cmdType);
      });
    });
  });
});
