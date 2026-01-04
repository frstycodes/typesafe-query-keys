import { createEngine } from '@/core/engine'
import { Config } from '@/core/services/config/config-schema'
import { singleton } from '@/core/utils/singleton'

async function plugin(opts: Config.Input) {
  const config = Config.parse(opts)
  const engine = createEngine(config)

  await engine.scanAndGenerate()

  if (process.env.NODE_ENV === 'production') {
    return engine.dispose()
  }

  // Start watching in dev mode with error handling
  engine.watch()

  const dispose = () => engine.dispose()

  process.on('SIGINT', dispose)
  process.on('SIGTERM', dispose)
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
 * import typesafeQueryKeysPluginGeneric from "@frsty/typesafe-query-keys/plugin/generic"
 *
 * // Initialize the plugin with your configuration
 * typesafeQueryKeysPluginGeneric({
 *   include: ['src/**\/*.ts'],
 *   exclude: ["temp", ".tanstack"],
 *   outputPath: ".generated/query-keys.d.ts",
 *   debugMode: true,
 *   debounceDelay: 1000,
 *   throwFatalErrors: false
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
const typesafeQueryKeysPluginGeneric = singleton(plugin)
export default typesafeQueryKeysPluginGeneric
