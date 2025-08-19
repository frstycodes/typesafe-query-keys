import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig'
import { Result, err, ok } from 'neverthrow'
import { Config, ConfigInsert, ConfigSchema } from './config.schema'
import path from 'path'
import fs from 'fs'
import { globifyGitIgnore } from 'globify-gitignore'
import { zodIssuesToString } from '../utils/zod'

const CFG_FILE_KEY = 'querykeys'

/**
 * Just a type-safe wrapper around the config object.
 */
export function defineConfig(config: ConfigInsert) {
  return config
}

export async function parseConfig(
  config: ConfigInsert,
): Promise<Result<Config, Error>> {
  const validate = ConfigSchema.safeParse(config)

  if (!validate.success) {
    return err(
      new Error('Invalid config: ' + zodIssuesToString(validate.error.issues)),
    )
  }

  const validated = validate.data as Config

  const includes = await globifyGitIgnore(validated.include.join('\n'))
  validated.include = includes.map((p) => p.glob)

  const excludes = await globifyGitIgnore(validated.exclude.join('\n'))
  validated.exclude = excludes.map((p) => p.glob)

  // Load ignore patterns from file if specified
  if (!validated.ignoreFile) return ok(validated)

  const ignoreFilePath = path.resolve(validated.ignoreFile)

  if (!fs.existsSync(ignoreFilePath)) {
    console.warn('WARN: Ignore file not found at path: ', ignoreFilePath)
    return ok(validated)
  }

  const fileContentRes = Result.fromThrowable(
    () => fs.readFileSync(ignoreFilePath, 'utf-8'),
    (error) => error as Error,
  )()

  if (fileContentRes.isErr()) {
    console.warn(
      'WARN: Failed to read ignore file at path: ',
      ignoreFilePath,
      '\n',
      fileContentRes.error,
    )
    return ok(validated)
  }

  const fileIgnorePatterns = await globifyGitIgnore(fileContentRes.value)
  for (const pattern of fileIgnorePatterns) validated.exclude.push(pattern.glob)

  return ok(validated)
}

export async function loadConfig(
  configFromCli: Config,
  configPath: string | null,
): Promise<Result<Config, Error>> {
  try {
    const explorer = cosmiconfig(CFG_FILE_KEY)
    let result: CosmiconfigResult

    if (configPath) {
      // Load config from specified path
      result = await explorer.load(configPath)
    } else {
      // Search for config if no path provided
      result = await explorer.search()
    }

    const filteredCliConfig = Object.fromEntries(
      Object.entries(configFromCli).filter(([_, v]) => v !== undefined),
    )

    const merged = { ...(result?.config ?? {}), ...filteredCliConfig }

    return parseConfig(merged)
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
