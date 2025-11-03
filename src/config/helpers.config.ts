import { cosmiconfig } from 'cosmiconfig'
import { err, ok } from 'neverthrow'
import { Config } from './schema.config'

const CONFIG_FILE_KEY = 'queryKeys'
export async function loadConfig(configPath?: string) {
  try {
    const explorer = cosmiconfig(CONFIG_FILE_KEY)
    const result = configPath
      ? await explorer.load(configPath)
      : await explorer.search()

    const merged = result?.config ?? {}
    return ok(await Config.parseAsync(merged))
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}

/** Just a type-safe wrapper around the config object. */
export async function defineConfig(config: Config.Input) {
  return await Config.parseAsync(config)
}
