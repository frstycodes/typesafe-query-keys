import * as Context from 'effect/Context'
import * as Layer from 'effect/Layer'

import { areArraysEqual } from '@/core/utils'

type CacheRecords = Record<string, FileMetadata>

type FileMetadata = {
  keys: string[]
  hash: string
  mTime: number
}

class SessionCache {
  private cache: CacheRecords = {}

  constructor() {}

  get(filePath: string): FileMetadata | undefined {
    return this.cache[filePath]
  }

  set(filePath: string, value: FileMetadata): void {
    this.cache[filePath] = value
  }

  delete(filePath: string): void {
    delete this.cache[filePath]
  }

  clear(): void {
    this.cache = {}
  }

  fileNames(): string[] {
    return Object.keys(this.cache)
  }

  files(): FileMetadata[] {
    return Object.values(this.cache)
  }

  entries(): [string, FileMetadata][] {
    return Object.entries(this.cache)
  }

  hasHashChanged(filePath: string, currentHash: string): boolean {
    const fileData = this.get(filePath)
    if (!fileData) return true // New file, needs scanning
    return fileData.hash !== currentHash
  }

  hasMtimeChanged(filePath: string, currentMtime: number): boolean {
    const fileData = this.get(filePath)
    if (!fileData) return true // New file, needs scanning
    return fileData.mTime !== currentMtime
  }

  haveKeysChanged(filePath: string, currentKeys: string[]): boolean {
    const fileData = this.get(filePath)
    if (!fileData) return true // New file, needs scanning
    return !areArraysEqual(fileData.keys, currentKeys)
  }

  collectAllKeys(): string[] {
    const allKeys = new Set<string>()
    for (const file in this.cache) {
      const fileData = this.get(file)
      if (!fileData) continue
      for (const key of fileData.keys) {
        allKeys.add(key)
      }
    }
    return [...allKeys]
  }

  getStats() {
    return {
      totalFiles: Object.keys(this.cache).length,
      totalKeys: this.collectAllKeys().length,
    }
  }
}

export class CacheService extends Context.Tag('CacheManager')<
  CacheService,
  SessionCache
>() {}

export const CacheServiceLive = Layer.sync(
  CacheService,
  () => new SessionCache(),
)
