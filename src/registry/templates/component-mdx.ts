import matter from "gray-matter";
import type { RegistryFile } from "../../types";

/**
 * Interface for component MDX template options
 */
interface ComponentMdxOptions {
  name: string;
  title: string;
  description: string;
  type: string;
  language: "astro" | "react" | "vue" | "html";
  files: RegistryFile[];
  author?: string;
  dependencies?: string[];
  shadcnRegistryDependencies?: string[];
  internalRegistryDependencies?: string[];
  otherRegistryDependencies?: string[];
  categories?: string[];
  defaultProps?: Record<string, any>;
}

/**
 * Generate a component MDX file
 * @param options Options for the component MDX file
 * @returns Content of the MDX file
 */
export function generateComponentMdx(options: ComponentMdxOptions): string {
  const frontmatter = {
    name: options.name,
    title: options.title,
    description: options.description,
    type: options.type.startsWith("registry:")
      ? options.type
      : `registry:${options.type}`,
    language: options.language,
    files: options.files,
    author: options.author || "",
    dependencies: options.dependencies || [],
    shadcnRegistryDependencies: options.shadcnRegistryDependencies || [],
    internalRegistryDependencies: options.internalRegistryDependencies || [],
    otherRegistryDependencies: options.otherRegistryDependencies || [],
    categories: options.categories || [options.type.replace("registry:", "")],
    defaultProps: options.defaultProps || {},
  };

  // Generate default content based on component type
  let content = "";

  if (options.type.includes("ui") || options.type.includes("component")) {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/components/${options.type.replace(
      "registry:",
      ""
    )}/${options.name}";

export default function Example() {
  return <${options.name} />;
}
\`\`\`

## Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| | | | |

## Examples

### Basic

\`\`\`${options.language}
<${options.name} />
\`\`\`
`;
  } else if (options.type.includes("hook")) {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/hooks/${options.name}";

export default function Example() {
  const result = ${options.name}();
  return <div>{JSON.stringify(result)}</div>;
}
\`\`\`

## Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| | | | |

## Return Value

| Name | Type | Description |
| ---- | ---- | ----------- |
| | | |

## Examples

### Basic

\`\`\`${options.language}
const result = ${options.name}();
\`\`\`
`;
  } else {
    content = `
# ${options.title}

${options.description}

## Usage

\`\`\`${options.language}
import { ${options.name} } from "@/${options.type.replace("registry:", "")}s/${
      options.name
    }";
\`\`\`

## Examples

### Basic

\`\`\`${options.language}
// Example usage
\`\`\`
`;
  }

  return matter.stringify(content, frontmatter);
}

/**
 * Generate a minimal component MDX file with just frontmatter
 * @param options Options for the component MDX file
 * @returns Content of the MDX file
 */
export function generateMinimalComponentMdx(
  options: ComponentMdxOptions
): string {
  const frontmatter = {
    name: options.name,
    title: options.title,
    description: options.description,
    type: options.type.startsWith("registry:")
      ? options.type
      : `registry:${options.type}`,
    language: options.language,
    files: options.files,
    author: options.author || "",
    dependencies: options.dependencies || [],
    shadcnRegistryDependencies: options.shadcnRegistryDependencies || [],
    internalRegistryDependencies: options.internalRegistryDependencies || [],
    otherRegistryDependencies: options.otherRegistryDependencies || [],
    categories: options.categories || [options.type.replace("registry:", "")],
    defaultProps: options.defaultProps || {},
  };

  return matter.stringify("", frontmatter);
}
