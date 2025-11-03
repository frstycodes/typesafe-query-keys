import type { Config } from '@/config/schema.config'
import { writeQueryKeysToFile } from '@/generator'
import { Logs } from '@/logs'
import { FileCollector, extractQueryKeys } from '@/scanner'
import { debounce } from '@/utils/debounce'
import { createLogger, type Logger } from '@/utils/logger'
import { withPerformance } from '@/utils/performance'
import { safeCallAsync } from '@/utils/safety'
import chokidar from 'chokidar'
import { readFile } from 'fs/promises'
import path from 'path'
import { extractParentKeys } from '@/utils/extract-parent-keys'

interface FSWatcher {
  close(): void
  on(
    event: 'add' | 'change' | 'unlink' | 'error',
    callback: (path: string) => void,
  ): this
}

export class FileWatcher {
  private rootDir: string
  private lastGenerationHash: string | null = null
  private watcher?: FSWatcher
  private collector: FileCollector
  private logger: Logger

  constructor(
    rootDir: string,
    private config: Config,
  ) {
    this.lastGenerationHash = null
    this.rootDir = path.resolve(rootDir)
    this.collector = new FileCollector(this.rootDir, this.config)
    this.logger = createLogger(this.config.verbose)
  }

  async start(watcher?: FSWatcher) {
    this.watcher = watcher

    if (!this.watcher) {
      const files = this.collector.collectFiles()
      this.watcher = chokidar.watch(files, {
        persistent: true,
        ignoreInitial: true,
      })
    }

    const debouncedOnFileChange = debounce(this.onFileChange.bind(this), 1e3)

    this.watcher
      .on('add', debouncedOnFileChange)
      .on('change', debouncedOnFileChange)
      .on('unlink', debouncedOnFileChange)
      .on('error', (err) => this.logger('error', '\u274C Watcher error:', err))

    this.logger('info', Logs.watchingForFileChanges)

    return this
  }

  stop() {
    this.watcher?.close()
    return this
  }

  async scanAndGenerate() {
    this.logger('info', Logs.scanningQueryKeys)
    const queryKeys = await this.extractAllQueryKeys()

    const [duration] = withPerformance(() => {
      this.lastGenerationHash = writeQueryKeysToFile({
        queryKeys,
        lastGenerationHash: this.lastGenerationHash,
        outputPath: this.config.outputPath,
      })
    })
    this.logger('log', Logs.generatedQueryKeys(queryKeys.length, duration))
    return this
  }

  async onFileChange(changedPath: string) {
    if (!this.collector.shouldProcess(changedPath)) return
    this.logger('debug', 'File changed: ', changedPath)
    await this.scanAndGenerate()
  }

  async extractAllQueryKeys() {
    const queryKeys = new Set<string>()
    const files = this.collector.collectFiles()

    await Promise.all(
      files.map(async (file) => {
        const contentRes = await safeCallAsync(readFile(file, 'utf-8'))
        if (contentRes.isErr()) {
          this.logger('warn', Logs.failedToReadFile(file, contentRes.error))
          return
        }

        extractQueryKeys({
          fileName: file,
          sourceText: contentRes.value,
          functionNames: this.config.functionNames,
          queryKeys,
        })
      }),
    )

    for (const key of queryKeys) {
      for (const parent of extractParentKeys(key)) queryKeys.add(parent)
    }
    return [...queryKeys]
    // return Array.from(queryKeys).sort((a, b) => a.localeCompare(b))
  }
}
