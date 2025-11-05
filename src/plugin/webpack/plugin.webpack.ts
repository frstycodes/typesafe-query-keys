import { Config } from '@/config/schema.config'
import { createFileWatcher } from '@/watcher'
import { WebpackPluginInstance } from 'webpack'
import { name as PackageName } from '../../../package.json'
import { singleton } from '@/utils/singleton'

const PLUGIN_NAME = PackageName + '/webpack-plugin'

function plugin(opts = {} as Config.Input) {
  let watcher: ReturnType<typeof createFileWatcher>

  return {
    apply(compiler) {
      if (compiler.options.mode != 'development') return

      compiler.hooks.watchRun.tap(PLUGIN_NAME, async () => {
        if (!watcher) {
          const config = await Config.parseAsync(opts)
          watcher = createFileWatcher(process.cwd(), config)
          watcher.scanAndGenerate()
          watcher.start()
        }
      })

      compiler.hooks.watchClose.tap(PLUGIN_NAME, async () => {
        watcher?.stop()
      })
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
export const typesafeQueryKeysPluginWebpack = singleton(plugin)
