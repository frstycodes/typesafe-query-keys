import type { Config } from '@/config'
import fs from 'fs'
import { globbySync } from 'globby'
import path from 'path'

export class FileCollector {
  private rootDir: string

  constructor(
    rootDir: string,
    private config: Config,
  ) {
    this.rootDir = path.resolve(rootDir)
  }

  collectFiles() {
    return globbySync(this.config.include, {
      ignore: this.config.exclude,
      cwd: this.rootDir,
    })
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
