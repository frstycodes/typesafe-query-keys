import { z } from 'zod/v4'

const ALWAYS_EXCLUDE = ['vite.config.*', '**/node_modules/**']
const DEFAULT_INCLUDE = ['**/*.{ts,tsx,js,jsx}']
export const DEFAULT_GEN_FILE = 'queryKeys.gen.d.ts'

type NoUndefinedObj<T> = Required<{
  [K in keyof T]: Exclude<T[K], undefined>
}>

export type ConfigInsert = {
  /**
   * Glob patterns specifying which files to include for query key extraction.
   * @example ["src/api/**\/*.{ts,tsx}", "routes", "app/queries"]
   * @note Exact glob patterns are recommended for better performance.
   */
  include?: string[] | undefined
  /**
   * Path to the output file where the generated type definitions will be written.
   * Defaults to "src/query-keys.gen.ts" in the project root.
   */
  outputFile?: string | undefined

  /**
   * Glob patterns specifying files to ignore during query key extraction.
   * Example: `["**\/*.test.ts"]`
   * - `node_modules` and `vite.config.*` are always ignored.
   */
  exclude?: string[] | undefined

  /**
   * Path to a file containing ignore patterns.
   * If specified, the plugin will load and respect the patterns listed in the file.
   */
  ignoreFile?: string | undefined | null

  /**
   * Whether to display detailed log messages during the type generation process.
   * When set to true, the plugin will log more information about its progress.
   */
  verbose?: boolean | undefined
}

export type Config = NoUndefinedObj<ConfigInsert>

export const ConfigSchema = z.object({
  include: z
    .array(z.string())
    .default([...DEFAULT_INCLUDE])
    .optional(),
  outputFile: z.string().default(DEFAULT_GEN_FILE).optional(),
  exclude: z
    .array(z.string())
    .default([])
    .transform((excludes) => [...excludes, ...ALWAYS_EXCLUDE])
    .optional(),
  ignoreFile: z.string().nullable().default(null).optional(),
  verbose: z.boolean().default(false).optional(),
}) satisfies z.ZodType<ConfigInsert>
