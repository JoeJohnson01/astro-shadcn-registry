/**
 * Generate a content collections config file for registry components
 * @param componentTypes Array of component types to include in the config
 * @returns Content of the config.ts file
 */
export function generateContentConfig(componentTypes: string[]): string {
  // Create collection definitions for each component type
  const collectionDefinitions = componentTypes
    .map((type) => {
      // Handle the special case for 'ui' which doesn't have a plural form
      const collectionName = type === "ui" ? type : `${type}s`;

      return `
  ${collectionName}: defineCollection({
    type: 'content',
    schema: z.object({
      name: z.string().optional(),
      title: z.string(),
      description: z.string(),
      type: z.string(),
      author: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      shadcnRegistryDependencies: z.array(z.string()).optional(),
      internalRegistryDependencies: z.array(z.string()).optional(),
      otherRegistryDependencies: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      docs: z.string().optional(),
      defaultProps: z.record(z.any()).optional(),
      language: z.enum(['astro', 'react', 'vue', 'html']),
      files: z.array(z.object({
        path: z.string(),
        type: z.string(),
        target: z.string().optional(),
      })),
      tailwind: z.any().optional(),
      cssVars: z.any().optional(),
      css: z.any().optional(),
      meta: z.record(z.any()).optional(),
    }),
  }),`;
    })
    .join("\n");

  return `// Content collections configuration for registry components
import { defineCollection, z } from 'astro:content';

// Define the collections
const collections = {${collectionDefinitions}
};

export const config = { collections };
`;
}

/**
 * Generate a content collections config file for registry components with custom schema
 * @param componentTypes Array of component types to include in the config
 * @param customSchema Custom schema to use for the collections
 * @returns Content of the config.ts file
 */
export function generateContentConfigWithCustomSchema(
  componentTypes: string[],
  customSchema: string
): string {
  // Create collection definitions for each component type
  const collectionDefinitions = componentTypes
    .map((type) => {
      // Handle the special case for 'ui' which doesn't have a plural form
      const collectionName = type === "ui" ? type : `${type}s`;

      return `
  ${collectionName}: defineCollection({
    type: 'content',
    schema: componentSchema,
  }),`;
    })
    .join("\n");

  return `// Content collections configuration for registry components
import { defineCollection, z } from 'astro:content';

// Define the component schema
const componentSchema = ${customSchema};

// Define the collections
const collections = {${collectionDefinitions}
};

export const config = { collections };
`;
}
