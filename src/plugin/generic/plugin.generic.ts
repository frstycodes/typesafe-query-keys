import { loadConfig } from '@/config/helpers.config'
import { Config } from '@/config/schema.config'
import { singleton } from '@/utils/singleton'
import { createFileWatcher } from '@/watcher'

async function plugin(opts?: Config.Input) {
  if (process.env.NODE_ENV !== 'development') return

  const config = opts
    ? await Config.parseAsync(opts)
    : await loadConfig().then((res) => res._unsafeUnwrap())

  const fileWatcher = createFileWatcher(process.cwd(), config)

  fileWatcher.scanAndGenerate()
  fileWatcher.start()
}

/**
 * Generic plugin for typesafe query key generation in unsupported frameworks.
 *
 * **⚠️ Warning:** Only use this plugin if there is no dedicated plugin available for your framework/bundler.
 *
 * # Overview
 * This plugin provides typesafe query key generation for frameworks that don't have official support.
 *
 * # Usage
 * Call this plugin in a file that runs in the Node.js environment (e.g., `next.config.ts`.
 * The plugin will only run in development mode (`NODE_ENV === 'development'`).
 *
 * @example
 * ```typescript
 * // next.config.ts
 * import { NextConfig } from "next";
 * import { typesafeQueryKeysPluginGeneric } from "@frsty/typesafe-query-keys/plugin/generic"
 *
 * // Initialize the plugin with your configuration
 * typesafeQueryKeysPluginGeneric({
 *   include: ['src/**\/*.queries.ts'],
 *   exclude: ["temp", ".tanstack"],
 *   functionNames: ['createQK', 'queryKey'],
 *   outputPath: ".generated/query-keys.d.ts",
 *   respectGitIgnore: true,
 *   verbose: true,
 * });
 *
 * const nextConfig: NextConfig = {
 *   // Your Next.js configuration
 * };
 *
 * export default nextConfig;
 * ```
 *
 * @see {@link https://github.com/frstycodes/typesafe-query-keys#readme Documentation} for more details
 */
export const typesafeQueryKeysPluginGeneric = singleton(plugin)
