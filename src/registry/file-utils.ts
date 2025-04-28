import fs from "fs";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { logger } from "../utils/logger";
import type { Frontmatter, RegistryEntry } from "../types";

/**
 * Check if a file exists
 * @param filePath Path to the file
 * @returns True if the file exists, false otherwise
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Create a directory if it doesn't exist
 * @param dirPath Path to the directory
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.debug(`Created directory: ${dirPath}`);
  }
}

/**
 * Read a file as text
 * @param filePath Path to the file
 * @returns File content as string
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Write content to a file
 * @param filePath Path to the file
 * @param content Content to write
 */
export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
  logger.debug(`Wrote file: ${filePath}`);
}

/**
 * Find all MDX/MD files in the content collections
 * @param contentCollectionPath Path to the content collections
 * @param componentTypes Valid component types
 * @returns Array of file paths
 */
export async function findContentFiles(
  contentCollectionPath: string,
  componentTypes: string[]
): Promise<string[]> {
  const patterns = componentTypes.map((type) => {
    // Handle the special case for 'ui' which doesn't have a plural form
    const collectionName = type === "ui" ? type : `${type}s`;
    return `${contentCollectionPath}/${collectionName}/*.{md,mdx}`;
  });

  return await fg(patterns, { absolute: true });
}

/**
 * Parse MDX/MD files to build registry entries
 * @param filePaths Array of file paths
 * @returns Array of registry entries
 */
export function parseRegistryEntries(filePaths: string[]): RegistryEntry[] {
  const entries: RegistryEntry[] = [];

  for (const filePath of filePaths) {
    try {
      // Check if file exists before trying to read it
      if (!fileExists(filePath)) {
        logger.warn(`File does not exist: ${filePath}`);
        continue;
      }

      const content = readFile(filePath);
      const { data } = matter(content);
      const frontmatter = data as Frontmatter;

      // Extract name from file name (without .mdx extension)
      const fileName = path.basename(filePath);
      const name = fileName.replace(/\.(md|mdx)$/, "");

      entries.push({
        name,
        filePath,
        frontmatter,
      });

      logger.debug(`Parsed registry entry: ${name}`);
    } catch (error) {
      // Log at different levels based on environment
      if (process.env.NODE_ENV === "test") {
        logger.debug(`Failed to parse ${filePath}: ${error}`);
      } else {
        logger.error(`Failed to parse ${filePath}: ${error}`);
      }
    }
  }

  return entries;
}

/**
 * Update an MDX file with new frontmatter
 * @param filePath Path to the MDX file
 * @param updates Updates to apply to the frontmatter
 */
export function updateMdxFile(
  filePath: string,
  updates: Record<string, unknown>
): void {
  const content = readFile(filePath);
  const { data, content: mdxContent } = matter(content);

  // Update frontmatter
  const newData = { ...data };

  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    if (Array.isArray(value) && Array.isArray(newData[key])) {
      // For arrays, merge and deduplicate
      newData[key] = Array.from(new Set([...(newData[key] || []), ...value]));
    } else {
      // For other values, replace
      newData[key] = value;
    }
  }

  // Write updated content back to file
  const updatedContent = matter.stringify(mdxContent, newData);
  writeFile(filePath, updatedContent);
  logger.debug(`Updated MDX file: ${filePath}`);
}

/**
 * Create a new MDX file with frontmatter
 * @param filePath Path to the MDX file
 * @param frontmatter Frontmatter to include
 * @param content MDX content (optional)
 */
export function createMdxFile(
  filePath: string,
  frontmatter: Record<string, unknown>,
  content: string = ""
): void {
  const mdxContent = matter.stringify(content, frontmatter);
  writeFile(filePath, mdxContent);
  logger.debug(`Created MDX file: ${filePath}`);
}
