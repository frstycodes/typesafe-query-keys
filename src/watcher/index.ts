import type { Config } from '@/config/schema.config'
import { FileWatcher } from './file-watcher'

export function createFileWatcher(rootDir: string, config: Config) {
  return new FileWatcher(rootDir, config)
}
