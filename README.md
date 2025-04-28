# Astro ShadCN Registry

A powerful Astro integration for generating ShadCN-compatible component registries from content collections.

## Overview

Astro ShadCN Registry is an integration that automatically generates a `registry.json` file from your component documentation in content collections. This registry file can be used with ShadCN UI or other component libraries that follow the registry format.

The integration focuses solely on registry generation without implementing UI components or route functionality, making it lightweight and flexible for your specific needs.

### Key Features

- **Automatic Registry Generation**: Generates a `registry.json` file from your MDX content collections
- **Content Collection Integration**: Works seamlessly with Astro's content collections
- **Component Dependency Analysis**: Automatically detects and tracks component dependencies
- **Path Normalization**: Automatically updates component paths when moving from /components to /registry
- **Pre-commit Hook Support**: Optionally regenerate the registry on git commits
- **Customizable Configuration**: Flexible configuration options for your project structure
- **CLI Commands**: Convenient commands for setup, generation, and validation

## Installation

### Using `astro add` (Recommended)

The easiest way to add the integration to your project:

```bash
# Using npm
npx astro add astro-shadcn-registry

# Using yarn
yarn astro add astro-shadcn-registry

# Using pnpm
pnpm astro add astro-shadcn-registry
```

This will install the package and automatically update your `astro.config.mjs` file with the integration.

### Manual Installation

Alternatively, you can install the package manually:

```bash
# Using npm
npm install astro-shadcn-registry

# Using yarn
yarn add astro-shadcn-registry

# Using pnpm
pnpm add astro-shadcn-registry
```

## Setup

You can set up the integration in three ways:

### 1. Using `astro add` (Recommended)

If you installed the integration using `astro add`, your `astro.config.mjs` file has already been updated with a basic configuration. You can run the setup wizard to customize it further:

```bash
npx astro registry:setup
```

### 2. Using the Setup Wizard

If you installed the package manually, run the setup wizard to configure the integration:

```bash
# Using the Astro CLI (recommended)
npx astro registry:setup

# Or using the package's CLI directly
npx astro-shadcn-registry setup
```

The wizard will guide you through the configuration process, update your `astro.config.mjs` file, and add necessary scripts to your package.json.

### 3. Manual Configuration

Add the integration to your `astro.config.mjs` file manually:

```javascript
import { defineConfig } from "astro/config";
import shadcnRegistry from "astro-shadcn-registry";

export default defineConfig({
  integrations: [
    shadcnRegistry({
      paths: {
        registry: "src/registry",
        contentCollection: "src/content",
        outputRegistry: "registry.json",
      },
      componentTypes: ["ui", "component", "hook", "lib"],
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
    }),
  ],
});
```

## Usage

### Directory Structure

The integration expects a directory structure like this:

```
src/
├── registry/
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
└── content/
    └── ui/
        ├── button.mdx
        └── card.mdx
registry.json (temporary)
public/r/ (output)
```

### Content Collections Configuration

You need to set up Astro content collections for your components. Create a `src/content/config.ts` file:

```typescript
import { defineCollection, z } from "astro:content";

// Define the schema for your component collections
const componentSchema = z.object({
  title: z.string(),
  description: z.string(),
  language: z.enum(["astro", "react", "vue", "html"]),
  type: z.string().optional(),
  files: z.array(
    z.object({
      path: z.string(),
      type: z.string(),
      target: z.string().optional(),
    })
  ),
  dependencies: z.array(z.string()).optional(),
  shadcnRegistryDependencies: z.array(z.string()).optional(),
  internalRegistryDependencies: z.array(z.string()).optional(),
  // Add other fields as needed
});

// Create collections for each component type
export const collections = {
  ui: defineCollection({ type: "content", schema: componentSchema }),
  components: defineCollection({ type: "content", schema: componentSchema }),
  // Add other collections as needed
};
```

### Content Collection Format

Your MDX files should include frontmatter with the following structure:

```mdx
---
name: button
type: registry:ui
title: Button
description: A button component with different variants.
language: react
files:
  - path: src/registry/ui/button.tsx
    type: registry:ui
dependencies:
  - react
  - clsx
internalRegistryDependencies: []
shadcnRegistryDependencies: []
---

# Button

A button component with different variants.

## Usage

...
```

### Component Dependencies

The integration supports several types of dependencies:

- `dependencies`: Regular npm package dependencies
- `internalRegistryDependencies`: Dependencies on other components in your registry
- `shadcnRegistryDependencies`: Dependencies on components from the shadcn registry

When generating the registry, the integration will automatically:

1. Detect missing dependencies
2. Create MDX files for missing registry components
3. Update the registry.json file with the correct dependencies

### Generating the Registry

The registry is automatically generated during development and build. You can also manually generate it:

```bash
npx astro-shadcn-registry build
```

The integration will:

1. Generate the registry.json file from your content collections
2. Use the shadcn CLI to build the public/r directory from the registry.json file
3. Delete the registry.json file after the build (this is enabled by default)

This process happens automatically during development and build, but you can also run it manually.

### Registry Output

The integration generates two main outputs:

1. **registry.json**: A temporary file used by the shadcn CLI (deleted after build by default)
2. **public/r/**: A directory containing individual JSON files for each component

The public/r directory structure looks like this:

```
public/
└── r/
    ├── button.json
    ├── card.json
    └── ...
```

These JSON files can be consumed by the shadcn CLI when users install components from your registry.

### Installing Components from Your Registry

Users can install components from your registry using the shadcn CLI:

```bash
npx shadcn@latest add https://your-site.com/r/button.json
```

Where `your-site.com` is the domain where your registry is hosted.

### CLI Commands

The integration provides several CLI commands that can be run through the Astro CLI:

```bash
# Generate the registry.json file
npx astro registry:generate

# Run the setup wizard
npx astro registry:setup

# Validate the registry configuration
npx astro registry:validate

# Install the pre-commit hook
npx astro registry:install-hook

# Uninstall the pre-commit hook
npx astro registry:uninstall-hook
```

Note: The Astro CLI commands require Astro 5.0 or later.

Alternatively, you can use the package's CLI commands directly:

```bash
# Generate the registry.json file and build the registry
npx astro-shadcn-registry build

# Run the setup wizard (adds scripts to package.json and configures the integration)
npx astro-shadcn-registry setup

# Validate the registry configuration
npx astro-shadcn-registry validate
```

The first time you run `setup`, it will automatically add the necessary scripts to your package.json.

The integration automatically adds a `build:registry` script to your package.json, so you can also run:

```bash
npm run build:registry
```

## Configuration Options

| Option                              | Description                             | Default                                                                         |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `paths.registry`                    | Path to the registry components         | `"src/registry"`                                                                |
| `paths.contentCollection`           | Path to the content collections         | `"src/content"`                                                                 |
| `paths.outputRegistry`              | Path to the output registry file        | `"registry.json"`                                                               |
| `componentTypes`                    | Types of components to include          | `["ui", "component", "block", "hook", "lib", "page", "file", "style", "theme"]` |
| `registry.name`                     | Name of the registry                    | `"my-registry"`                                                                 |
| `registry.homepage`                 | Homepage URL of the registry            | `"https://mycomponents.com"`                                                    |
| `preCommitHook.enabled`             | Whether to enable the pre-commit hook   | `false`                                                                         |
| `preCommitHook.paths`               | Paths to watch for changes              | `["src/registry/**/*"]`                                                         |
| `advanced.defaultLanguage`          | Default language for components         | `"react"`                                                                       |
| `advanced.registryURL`              | Registry URL                            | `"https://mycomponents.com"`                                                    |
| `advanced.deleteRegistryAfterBuild` | Delete registry.json after shadcn build | `true`                                                                          |

## Architecture

The integration works by:

1. **Scanning Content Collections**: Reads MDX files from your content collections to gather component metadata
2. **Analyzing Dependencies**: Detects dependencies between components and external packages
3. **Generating Registry**: Creates a registry.json file in the format expected by the shadcn CLI
4. **Building Registry Files**: Uses the shadcn CLI to build individual component JSON files in public/r/
5. **Cleaning Up**: Removes the temporary registry.json file after building

During development and build, the integration hooks into Astro's lifecycle to automatically generate and update the registry.

## Local Development

### Using npm link (Recommended)

The easiest way to develop and test the integration locally is using npm link:

```bash
# In the astro-shadcn-registry directory
npm link

# In your Astro project directory
npm link astro-shadcn-registry
```

This creates a symbolic link instead of installing from npm. After linking, you can use the CLI commands:

```bash
# Generate the registry
npx astro-shadcn-registry build

# Run the setup wizard
npx astro-shadcn-registry setup
```

The integration will automatically add necessary scripts to your project's package.json.

### Using a Local Path

Alternatively, you can reference the local directory in your package.json:

```json
{
  "dependencies": {
    "astro-shadcn-registry": "file:../path/to/astro-shadcn-registry"
  }
}
```

Then run `npm install` to link the local package.

## License

MIT
