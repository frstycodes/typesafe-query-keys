import type { Config } from '@/config'
import { Logs } from '@/logs'
import { createLogger, Logger } from '@/utils'
import { safeCall } from '@/utils/safety'
import fs from 'fs'
import { globbySync } from 'globby'
import path from 'path'

export class FileCollector {
  private rootDir: string
  private logger: Logger

  constructor(
    rootDir: string,
    private config: Config,
  ) {
    this.rootDir = path.resolve(rootDir)
    this.logger = createLogger(config.verbose)
  }

  collectFiles() {
    return safeCall(
      () =>
        globbySync(this.config.include, {
          cwd: this.rootDir,
          gitignore: this.config.respectGitIgnore,
          ignore: this.config.exclude,
        }),
      (err) => {
        this.logger('error', Logs.failedToCollectFiles(err))
        return null
      },
    )
  }

  shouldProcess(file: string) {
    if (!fs.existsSync(file)) return false
    if (!fs.statSync(file).isFile()) return false
    if (this.matchesAnyGlob(file, this.config.exclude)) return false
    if (!this.matchesAnyGlob(file, this.config.include)) return false
    return true
  }

  matchesAnyGlob(filePath: string, globs: string[]) {
    const relative = path.relative(process.cwd(), filePath)
    const normalized = relative.replace(/\\/g, '/')
    return globs.some((g) => path.matchesGlob(normalized, g))
  }
}
