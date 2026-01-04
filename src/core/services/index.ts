import { Layer } from 'effect'

import { CacheServiceLive } from './cache'
import { FileCollectorLive } from './file-collector'
import { LoggerServiceLive } from './logger'
import { NodeContext } from '@effect/platform-node/index'

export { CacheService, CacheServiceLive } from './cache'
export { ConfigService } from './config'
export { FileCollectorLive, FileCollectorService } from './file-collector'
export { LoggerService, LoggerServiceLive } from './logger'

export const LiveLayer = Layer.mergeAll(
  NodeContext.layer,
  CacheServiceLive,
  LoggerServiceLive,
  FileCollectorLive,
)
