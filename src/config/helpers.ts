import { cosmiconfig } from 'cosmiconfig'
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
  validated.exclude.push(...fileIgnorePatterns.map((pattern) => pattern.glob))

  return ok(validated)
}

export async function loadConfig(): Promise<Result<Config, Error>> {
  try {
    const explorer = cosmiconfig(CFG_FILE_KEY)
    const result = await explorer.search()
    return parseConfig(result?.config ?? {})
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
