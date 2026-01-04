import type { Plugin, PluginOption } from 'vite'
import { Config } from '@/core/services/config/config-schema'
import { createEngine } from '../engine'

const PLUGIN_NAME = '@frsty/typesafe-query-keys-vite-plugin'

export default function typesafeQueryKeysPluginVite(
  opts: Config.Input = {},
): PluginOption {
  const engine = createEngine(Config.parse(opts))

  return {
    name: PLUGIN_NAME,

    buildStart() {
      engine.scanAndGenerate()
    },

    configureServer(server) {
      engine.watch(server.watcher)
    },

    closeWatcher() {
      engine.dispose()
    },
  } satisfies Plugin
}
