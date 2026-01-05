import { Config } from '../services/config'
import typesafeQueryKeysPluginGeneric from './generic'

/**
 * Next.js plugin for typesafe query keys configuration.
 *
 * @template T - The type of the Next.js configuration object
 * @param nextConfig - The Next.js configuration object to be extended
 * @param pluginConfig - The plugin configuration input
 * @returns The original Next.js configuration object
 */
export default function typesafeQueryKeysPluginNext<T extends object>(
  nextConfig: T,
  pluginConfig: Config.Input,
) {
  typesafeQueryKeysPluginGeneric(pluginConfig)

  return nextConfig
}
