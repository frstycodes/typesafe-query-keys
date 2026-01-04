import { Effect, Layer, ManagedRuntime, Stream } from 'effect'
import * as Duration from 'effect/Duration'

import { Logs } from '@/core/config'
import { ConfigService, LiveLayer, LoggerService } from '@/core/services'
import type { Config } from '@/core/services/config/config-schema'
import { createWatcher, generateTypes, processAllFiles } from './engine.utils'
import { FileChangeEvent, handleFileEvent } from './file-event-handlers'
import { dedupeBy } from '../utils/object'

interface FSWatcher {
  close(): void
  on(
    event: 'add' | 'change' | 'unlink' | 'error',
    callback: (path: string) => void,
  ): this
}

const watch = (fsWatcher?: FSWatcher) =>
  Effect.gen(function* () {
    const logger = yield* LoggerService
    const config = yield* ConfigService

    const watcher =
      fsWatcher ?? (yield* createWatcher(config).pipe(Effect.orDie))

    const eventStream = Stream.async<FileChangeEvent>((emit) => {
      const registerHandler =
        (type: FileChangeEvent['_tag']) => (path: string) =>
          emit.single({ _tag: type, path })

      watcher
        .on('add', registerHandler('Add'))
        .on('change', registerHandler('Change'))
        .on('unlink', registerHandler('Unlink'))
        .on('error', (err) => logger.error('Watcher error:', err))

      return Effect.gen(function* () {
        logger.log(Logs.stoppingWatcher)
        watcher.close()
      })
    })

    logger.log(Logs.watchingForFileChanges)
    yield* eventStream.pipe(
      Stream.groupedWithin(100, Duration.millis(config.debounceDelay)),
      Stream.mapEffect((events) =>
        Effect.gen(function* () {
          const start = performance.now()

          const deduped = dedupeBy(Array.from(events), (e) => e.path)
          logger.debug(`Processing batch of ${deduped.length} file changes`)

          const results = yield* Effect.all(deduped.map(handleFileEvent), {
            concurrency: 'unbounded',
          })

          const shouldRegenerate = results.some(Boolean)
          if (!shouldRegenerate) return

          const count = yield* generateTypes()

          const end = performance.now()
          logger.log(Logs.generatedQueryKeys(count, end - start))
        }),
      ),
      Stream.runDrain,
    )
  })

const scanAndGenerate = Effect.gen(function* () {
  const start = performance.now()
  const logger = yield* LoggerService

  logger.log(Logs.scanningQueryKeys)

  const shouldGenerate = yield* processAllFiles()
  if (!shouldGenerate) return

  const count = yield* generateTypes()

  const end = performance.now()
  logger.log(Logs.generatedQueryKeys(count, end - start))
})

export function createEngine(config: Config) {
  const AppLayer = LiveLayer.pipe(
    Layer.provideMerge(Layer.succeed(ConfigService, config)),
  )

  const runtime = ManagedRuntime.make(AppLayer)

  return {
    watch(fsWatcher?: FSWatcher) {
      return runtime.runPromise(watch(fsWatcher))
    },
    scanAndGenerate() {
      return runtime.runPromise(scanAndGenerate)
    },
    dispose: () => runtime.dispose(),
  }
}
