import { cosmiconfig } from "cosmiconfig";
import fs from "fs";
import path from "path";
import { Result, ok, err } from "neverthrow";
import { z } from "zod/v4";

const ALWAYS_EXCLUDE = ["vite.config.*", "**/node_modules/**"];
const DEFAULT_INCLUDE = ["**/*.{ts,tsx,js,jsx}"];
const DEFAULT_GEN_FILE = "queryKeys.gen.d.ts";
const CFG_FILE_KEY = "querykeys";

type NoUndefinedObj<T> = Required<{
  [K in keyof T]: Exclude<T[K], undefined>;
}>;

export type ConfigInsert = z.infer<typeof ConfigSchema>;
export type Config = NoUndefinedObj<ConfigInsert>;

export const ConfigSchema = z.object({
  /**
   * Glob patterns specifying which files to include for query key extraction.
   * Example: `["src/api/**\/*.ts"]`
   */
  include: z
    .array(z.string())
    .default([...DEFAULT_INCLUDE])
    .optional(),

  /**
   * Path to the output file where the generated type definitions will be written.
   * Defaults to "src/query-keys.gen.ts" in the project root.
   */
  outputFile: z.string().default(DEFAULT_GEN_FILE).optional(),

  /**
   * Glob patterns specifying files to ignore during query key extraction.
   * Example: `["**\/*.test.ts"]`
   * - `node_modules` and `vite.config.*` are always ignored.
   */
  exclude: z
    .array(z.string())
    .default([])
    .transform((excludes) => [...excludes, ...ALWAYS_EXCLUDE])
    .optional(),

  /**
   * Path to a file containing ignore patterns (one per line, # for comments).
   * Useful for sharing ignore rules (e.g., a .gitignore file).
   */
  ignoreFile: z.string().nullable().default(null).optional(),

  /**
   * Whether to display detailed log messages during the type generation process.
   * When set to true, the plugin will log more information about its progress.
   */
  verbose: z.boolean().default(false).optional(),
});

/**
 * Just a type-safe wrapper around the config object.
 */
export function defineConfig(config: ConfigInsert) {
  return config;
}

export function parseConfig(config: ConfigInsert): Result<Config, Error> {
  const validate = ConfigSchema.safeParse(config);
  if (!validate.success) {
    return err(
      new Error(
        "Invalid config: " +
          validate.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; "),
      ),
    );
  }
  const validated = validate.data as Config;

  // Load ignore patterns from file if specified
  if (!validated.ignoreFile) return ok(validated);

  const ignoreFilePath = path.resolve(validated.ignoreFile);

  if (!fs.existsSync(ignoreFilePath)) {
    console.warn("WARN: Ignore file not found at path: ", ignoreFilePath);
    return ok(validated);
  }

  const readResult = Result.fromThrowable(
    () => fs.readFileSync(ignoreFilePath, "utf-8"),
    (error) => error as Error,
  )();

  if (readResult.isErr()) {
    console.warn(
      "WARN: Failed to read ignore file at path: ",
      ignoreFilePath,
      "\n",
      readResult.error,
    );
    return ok(validated);
  }

  const ignoreContent = readResult.value;

  // Parse the ignore file content line by line
  const fileIgnorePatterns = ignoreContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((pattern) => {
      // Skip patterns that already have glob metacharacters
      if (
        pattern.includes("*") ||
        pattern.includes("?") ||
        pattern.includes("[")
      ) {
        return pattern;
      }

      // Check if this is a directory pattern (no file extension)
      // If a pattern has no file extension and doesn't end with a slash,
      // add a trailing slash to make it match as a directory
      if (!pattern.endsWith("/") && !hasFileExtension(pattern)) {
        return `${pattern}/`;
      }

      return pattern;
    });

  validated.exclude.push(...fileIgnorePatterns);
  return ok(validated);
}

/**
 * Check if a pattern has a file extension
 * @param pattern The pattern to check
 * @returns True if the pattern appears to have a file extension
 */
function hasFileExtension(pattern: string): boolean {
  // If the pattern contains a dot that's not at the start
  // and has at least one character after it, it likely has a file extension
  const lastDotIndex = pattern.lastIndexOf(".");
  return lastDotIndex > 0 && lastDotIndex < pattern.length - 1;
}

export async function loadConfig(): Promise<Result<Config, Error>> {
  try {
    const explorer = cosmiconfig(CFG_FILE_KEY);
    const result = await explorer.search();
    return parseConfig(result?.config ?? {});
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
