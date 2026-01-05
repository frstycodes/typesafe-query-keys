import * as Layer from 'effect/Layer'

import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem'
import * as NodePath from '@effect/platform-node/NodePath'

import { CacheServiceLive } from './cache'
import { FileCollectorLive } from './file-collector'
import { LoggerServiceLive } from './logger'

// exports
export { CacheService, CacheServiceLive } from './cache'
export { ConfigService } from './config'
export { FileCollectorLive, FileCollectorService } from './file-collector'
export { LoggerService, LoggerServiceLive } from './logger'

export const LiveLayer = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  CacheServiceLive,
  LoggerServiceLive,
  FileCollectorLive,
)
