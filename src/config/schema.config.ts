import { z } from 'zod/v4'
import { globifyGitIgnore } from 'globify-gitignore'

const ALWAYS_EXCLUDE = ['vite.config.*', 'node_modules']
const DEFAULT_INCLUDE = ['**/*.{ts,tsx,js,jsx}']

export async function globbifyPatterns(patterns: string[]) {
  if (patterns.length == 0) return []
  const globs = await globifyGitIgnore(patterns.join('\n'))
  const res = globs.map((item) => item.glob)
  return res
}

type Config = {
  /**
   * Glob patterns specifying which files to include for query key extraction.
   * @example ["src/api/**\/*.{ts,tsx}", "routes", "app/queries"]
   * @note `**\/*.{ts,tsx,js,jsx}` is included by default if nothing is passed.
   */
  include: string[]
  /**
   * Glob patterns specifying files to ignore during query key extraction.
   * @example `["**\/*.test.ts"]`
   * @note `node_modules` and `vite.config.*` are always ignored.
   */
  exclude: string[]
  /**
   * Array of function names to include in the query key extraction.
   * @example { functionNames: ["qk", "createQueryKey", "queryKey"] }
   */
  functionNames: string[]
  /**
   * Whether to respect `.gitignore` files when extracting query keys.
   * When set to true, the plugin will ignore files and directories listed in `.gitignore`.
   * @default true
   */
  respectGitIgnore: boolean
  /**
   * Whether to display detailed log messages during the type generation process.
   * When set to true, the plugin will log more information about its progress.
   * @default false
   */
  verbose: boolean
  /**
   * Output path for the generated query key types.
   * @default '.generated/query-keys.d.ts'
   */
  outputPath: string
}

const Config = z.object({
  include: z
    .array(z.string())
    .optional()
    .default(DEFAULT_INCLUDE)
    .transform(globbifyPatterns),
  exclude: z
    .array(z.string())
    .optional()
    .default([])
    .refine((item) => globbifyPatterns([...item, ...ALWAYS_EXCLUDE])),
  functionNames: z
    .array(z.string())
    .optional()
    .default([])
    .transform((item) => [...item, 'qk']),
  respectGitIgnore: z.boolean().optional().default(true),
  verbose: z.boolean().optional().default(false),
  outputPath: z.string().optional().default('.generated/query-keys.d.ts'),
}) satisfies z.ZodType<Config>

namespace Config {
  export type Input = z.input<typeof Config>
}

export { Config }
