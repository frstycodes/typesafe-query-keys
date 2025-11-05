import { z } from 'zod/v4'
import { globifyGitIgnore } from 'globify-gitignore'

const ALWAYS_EXCLUDE = ['vite.config.*', 'node_modules']
const DEFAULT_INCLUDE = ['src/**/*.{ts,tsx,js,jsx}']

export async function globbifyPatterns(patterns: string[]) {
  if (patterns.length == 0) return []
  const globs = await globifyGitIgnore(patterns.join('\n'))
  const res = globs.map((item) => item.glob)
  return res
}

interface Config {
  /**
   * Glob patterns specifying which files to include for query key extraction.
   * @example ["src/api/**\/*.{ts,tsx}", "routes", "app/queries"]
   * @tip For better performance, consider specifying only the necessary files.
   * @note `src/**\/*.{ts,tsx,js,jsx}` is included by default if nothing is passed.
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
  include: z.array(z.string()).optional().default(DEFAULT_INCLUDE),
  exclude: z
    .array(z.string())
    .optional()
    .default([])
    .transform((item) => globbifyPatterns([...item, ...ALWAYS_EXCLUDE])),
  functionNames: z
    .array(z.string())
    .optional()
    .default([])
    .transform((item) => uniqueArr([...item, 'qk'])),
  verbose: z.boolean().optional().default(false),
  outputPath: z
    .string()
    .optional()
    .default('.generated/query-keys.d.ts')
    .transform(ensureDTS),
}) satisfies z.ZodType<Config>

namespace Config {
  export type Input = Partial<Config>
}

export { Config }

function uniqueArr<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function ensureDTS(path: string) {
  const pathArr = path.split('/')
  const fileName = pathArr.pop()!

  if (fileName.endsWith('.d.ts')) return path

  const nameArr = fileName.split('.')
  if (nameArr.length == 1) {
    nameArr.push('d.ts')
  } else {
    nameArr.pop()
    nameArr.push('d.ts')
  }
  const newName = nameArr.join('.')
  pathArr.push(newName)
  return pathArr.join('/')
}
