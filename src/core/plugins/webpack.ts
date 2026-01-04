import { singleton } from '@/core/utils/singleton'
import { WebpackPluginInstance } from 'webpack'
import { Config } from '@/core/services/config/config-schema'
import { createEngine } from '../engine'

const PLUGIN_NAME = '@frsty/typesafe-query-keys-webpack-plugin'

function plugin(opts = {} as Config.Input) {
  const parsed = Config.parse(opts)
  const engine = createEngine(parsed)

  let hasInitialized = false
  let isWatching = false

  return {
    apply(compiler) {
      const isWatchMode = compiler.options.watch || compiler.watchMode

      // For production builds or non-watch mode
      if (!isWatchMode) {
        compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
          await engine.scanAndGenerate()
        })
        return
      }

      // For watch/dev mode
      // Run once at startup before first compilation
      compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
        if (!hasInitialized) {
          await engine.scanAndGenerate()
          hasInitialized = true

          // Start watching after initial scan
          if (!isWatching) {
            isWatching = true
            engine.watch()
          }
        }
      })

      // Cleanup when webpack stops
      compiler.hooks.watchClose.tap(PLUGIN_NAME, () => {
        if (isWatching) {
          engine.dispose()
          isWatching = false
        }
      })

      const cleanup = () => {
        if (isWatching) engine.dispose()
      }
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
    },
  } satisfies WebpackPluginInstance
}

/**
 * Webpack plugin for typesafe query keys generation.
 * Automatically watches and generates query keys during development builds.
 *
 * @param {Config.Input} opts - Configuration options for the plugin
 * @returns {WebpackPluginInstance} Webpack plugin instance
 *
 * @example
 * // webpack.config.js
 * const typesafeQueryKeys = require('@frsty/typesafe-query-keys/plugin/webpack');
 *
 * module.exports = {
 *   plugins: [
 *     typesafeQueryKeys({
 *       include: ['src/**\/*.queries.ts'],
 *       exclude: ["temp", ".tanstack"],
 *       functionNames: ['createQK', 'queryKey'],
 *       outputPath: ".generated/query-keys.d.ts",
 *       respectGitIgnore: true,
 *       verbose: true,
 *     })
 *   ]
 * };
 *
 * @example
 * // If using Next.JS without turbo
 * import { NextConfig } from "next"
 * import typesafeQueryKeys from '@frsty/typesafe-query-keys/plugin/webpack');
 *
 * export default {
 *   webpack: (config) => {
 *     config.plugins.push(
 *       typesafeQueryKeys({
 *         // Config here
 *       })
 *     )
 *     return config;
 *   }
 * } satisfies NextConfig
 *
 * @see {@link https://github.com/frstycodes/typesafe-query-keys#readme Documentation} for more details
 */
const typesafeQueryKeysPluginWebpack = singleton(plugin)

export default typesafeQueryKeysPluginWebpack
