import { FileSystem, Path } from '@effect/platform'
import { Context, Effect, Layer } from 'effect'
import { globbySync } from 'globby'
import { ConfigService } from '../config'
import { GlobbyError } from '@/core/errors'

const FileCollector = {
  collectFiles() {
    return Effect.gen(function* () {
      const config = yield* ConfigService

      return yield* Effect.try({
        try: () =>
          globbySync(config.include.patterns, {
            ignore: config.exclude.patterns,
            cwd: config.rootDir,
            absolute: true,
          }),
        catch: (error) =>
          new GlobbyError({ message: 'Failed to collect files', cause: error }),
      })
    })
  },

  shouldProcess(file: string) {
    return Effect.gen(function* () {
      const config = yield* ConfigService
      const fs = yield* FileSystem.FileSystem

      const relative = yield* ensureRelativePath(config.rootDir, file)

      const exists = yield* fs.exists(file)
      if (!exists) return false

      const stat = yield* fs.stat(file)
      if (stat.type !== 'File') return false

      if (config.exclude.matches(relative)) return false
      return config.include.matches(relative)
    })
  },
}

const ensureRelativePath = (rootDir: string, file: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path
    if (path.isAbsolute(file)) return path.relative(rootDir, file)
    return file
  })

export class FileCollectorService extends Context.Tag('FileCollectorService')<
  FileCollectorService,
  typeof FileCollector
>() {}

export const FileCollectorLive = Layer.succeed(
  FileCollectorService,
  FileCollector,
)
