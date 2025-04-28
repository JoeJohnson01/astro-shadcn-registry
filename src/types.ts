/**
 * Types for the astro-shadcn-registry integration
 */

/**
 * Configuration for the astro-shadcn-registry integration
 */
export interface ShadcnRegistryConfig {
  /**
   * Path configuration
   */
  paths: {
    /**
     * Where components to be included in registry are stored
     * @default "src/registry"
     */
    registry: string;

    /**
     * Where MDX content collections are stored
     * @default "src/content"
     */
    contentCollection: string;

    /**
     * Output path for the generated registry file
     * @default "registry.json"
     */
    outputRegistry: string;
  };

  /**
   * Component types configuration
   * @default ["ui", "component", "block", "hook", "lib", "page", "file", "style", "theme"]
   */
  componentTypes: string[];

  /**
   * Registry metadata
   */
  registry: {
    /**
     * Name of the registry
     * @default "my-registry"
     */
    name: string;

    /**
     * Homepage URL of the registry
     * @default "https://mycomponents.com"
     */
    homepage: string;
  };

  /**
   * Pre-commit hook configuration
   */
  /**
   * Pre-commit hook configuration
   */
  preCommitHook?: {
    // Whether to enable the pre-commit hook (default: false)
    enabled?: boolean;

    // Paths to watch for changes (default: src/registry/**/*)
    paths?: string[];
  };

  /**
   * Advanced options
   */
  advanced: {
    // Default language for components (default: react)
    defaultLanguage: "astro" | "react" | "vue" | "html";

    // Registry URL (default: https://mycomponents.com)
    registryURL: string;

    // Whether to delete the registry.json file after building with shadcn (default: false)
    deleteRegistryAfterBuild?: boolean;
  };
}

/**
 * Define the shape of files in the registry
 */
export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

/**
 * Define frontmatter keys expected in each MDX/MD file
 */
export interface Frontmatter {
  name?: string;
  type: string;
  title: string;
  description: string;
  author?: string;
  dependencies?: Array<string | Record<string, string>>;
  shadcnRegistryDependencies?: string[];
  internalRegistryDependencies?: string[];
  otherRegistryDependencies?: string[];
  categories?: string[];
  docs?: string;
  defaultProps?: Record<string, unknown>;
  language: "astro" | "react" | "vue" | "html";
  files: RegistryFile[];
  tailwind?: Record<string, unknown>;
  cssVars?: Record<string, unknown>;
  css?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

/**
 * Interface for registry entries
 */
export interface RegistryEntry {
  name: string;
  filePath: string;
  frontmatter: Frontmatter;
}

/**
 * Interface for registry items in the output JSON
 */
export interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  author: string;
  dependencies?: Array<string | Record<string, string>>;
  registryDependencies: string[];
  categories?: string[];
  docs: string;
  files: RegistryFile[];
  tailwind?: Record<string, unknown>;
  cssVars?: Record<string, unknown>;
  css?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

/**
 * Type for spinner returned by logger.spinner
 */
export interface Spinner {
  update: (message: string) => void;
  complete: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Type for component MDX template options
 */
export interface ComponentMdxOptions {
  name: string;
  title: string;
  description: string;
  type: string;
  language: "astro" | "react" | "vue" | "html";
  files: RegistryFile[];
  author?: string;
  dependencies?: Array<string | Record<string, string>>;
  shadcnRegistryDependencies?: string[];
  internalRegistryDependencies?: string[];
  otherRegistryDependencies?: string[];
  categories?: string[];
  defaultProps?: Record<string, unknown>;
}

/**
 * Interface for the registry output JSON
 */
export interface Registry {
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

/**
 * Interface for dependency updates
 */
export interface DependencyUpdates {
  dependencies?: string[];
  shadcnRegistryDependencies?: string[];
  internalRegistryDependencies?: string[];
  otherRegistryDependencies?: string[];
  files?: RegistryFile[];
  [key: string]: unknown;
}
