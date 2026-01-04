import { FileSystem, Path } from '@effect/platform'
import { Effect } from 'effect'
import { LoggerService } from '../services'
import { queryKeysTemplate } from './template'

export type WriteQueryKeysToFileProps = {
  queryKeys: string[]
  outputPath: string
}

export function writeQueryKeysToFile({
  queryKeys,
  outputPath,
}: WriteQueryKeysToFileProps) {
  return Effect.gen(function* () {
    const path = yield* Path.Path
    const logger = yield* LoggerService

    const fileContent = queryKeysTemplate(queryKeys)
    const dir = path.dirname(outputPath)

    yield* Effect.gen(function* () {
      yield* ensureDir(dir)
      yield* writeFileAtomic(outputPath, fileContent)
    }).pipe(
      Effect.catchAll((e) => {
        logger.error(
          `Error writing query keys to file: ${outputPath}, types maybe stale`,
          e,
        )
        return Effect.void
      }),
    )
  })
}

export function ensureDir(dir: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const dirExists = yield* fs.exists(dir)
    if (!dirExists) {
      yield* fs.makeDirectory(dir, { recursive: true })
    }
  })
}

export function writeFileAtomic(filePath: string, content: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const tmp = filePath + '.tmp'

    yield* Effect.acquireUseRelease(
      fs.writeFileString(tmp, content),
      () => fs.rename(tmp, filePath),
      () => fs.remove(tmp).pipe(Effect.ignore), // Cleanup on error
    )
  })
}
