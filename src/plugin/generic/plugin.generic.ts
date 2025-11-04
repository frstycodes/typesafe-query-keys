import { loadConfig } from '@/config/helpers.config'
import { Config } from '@/config/schema.config'
import { createFileWatcher } from '@/watcher'

/**
 *  __DO NOT USE THIS__ if there is a dedicated plugin for your framework/bundler.
 *
 * - This is a generic plugin that can be used with frameworks that are not officially supported.
 * - To use this plugin, call this plugin inside a file that runs in the node environment. e.g. `next.config.ts`
 *
 * @example
 * import { NextConfig } from "next";
 * import { typesafeQueryKeysPluginGeneric } from "@frsty/typesafe-query-keys/plugin/generic"
 *
 * typesafeQueryKeysPluginGeneric({
 *   include: ["app/**\/*.queries.ts"],
 *   functionNames: ["createQK", "queryKey"]
 })
 *
 * export default {
 * // Your next config goes here.
 * } satisfies NextConfig
 *
 */
export async function typesafeQueryKeysPluginGeneric(opts?: Config.Input) {
  if (process.env.NODE_ENV !== 'development') return

  const config = opts
    ? await Config.parseAsync(opts)
    : await loadConfig().then((res) => res._unsafeUnwrap())

  const fileWatcher = createFileWatcher(process.cwd(), config)

  fileWatcher.scanAndGenerate()
  fileWatcher.start()
}
