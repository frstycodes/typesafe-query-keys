import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { FileSystem } from '@effect/platform/FileSystem'
import { Path } from '@effect/platform/Path'

import { globbySync } from 'globby'

import { GlobbyError } from '@/core/errors'
import { ConfigService } from '@/core/services/config'

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
      const fs = yield* FileSystem

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
    const path = yield* Path
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
