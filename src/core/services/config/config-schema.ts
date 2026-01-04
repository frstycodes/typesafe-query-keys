import { z } from 'zod/v4'
import path from 'path'
import { globbify } from '@/core/utils'

const ALWAYS_EXCLUDE = ['node_modules/']

interface ConfigImpl {
  /**
   * Root directory for resolving relative paths.
   * All relative paths in include, exclude, and outDir are resolved relative to this directory.
   * @default process.cwd()
   * @example './src' or '/absolute/path/to/project' */
  rootDir: string
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
   * Whether to display detailed log messages during the type generation process.
   * When set to true, the plugin will log more information about its progress.
   * @default false
   */
  debugMode: boolean
  /**
   * Output file path for the generated query key types.
   * @default 'query-keys.gen.d.ts'
   */
  outputPath: string
  /**
   * Debounce delay in milliseconds before triggering re-generation after file changes.
   * @default 1000
   */
  debounceDelay: number
}

const Config = (
  z.object({
    rootDir: z
      .string()
      .optional()
      .default(process.cwd())
      .transform((dir) => path.resolve(process.cwd(), dir)),
    include: z.array(z.string()).optional().default([]),
    exclude: z
      .array(z.string())
      .optional()
      .default([])
      .transform((items) => [...items, ...ALWAYS_EXCLUDE]),
    debugMode: z.boolean().optional().default(false),
    outputPath: z.string().optional().default('query-keys.d.ts'),
    debounceDelay: z.number().min(0).optional().default(1000),
  }) satisfies z.ZodType<ConfigImpl>
).transform((config) => {
  config.outputPath = path.resolve(config.rootDir, config.outputPath)

  return {
    ...config,
    include: globbify(config.include),
    exclude: globbify(config.exclude),
  }
})

type Config = z.output<typeof Config>

namespace Config {
  export type Input = z.input<typeof Config>
}

export { Config }
