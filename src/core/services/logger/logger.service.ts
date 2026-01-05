import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ConfigService } from '../config/config.service'

class StdoutLogger {
  constructor(private debugMode: boolean) {}

  fatal(message: string, error?: any): never {
    console.error('❌ FATAL: ', message)
    if (error) console.error(error)
    process.exit(1)
  }

  error(message: string, error?: any) {
    console.error('❌ ERROR: ', message)
    if (error && this.debugMode) console.error(error)
  }

  warn(message: string, error?: any) {
    console.warn('⚠️ WARN: ', message)
    if (error && this.debugMode) console.warn(error)
  }

  log(...args: any[]) {
    console.log(...args)
  }

  /** Alias for Logger.log */
  get info() {
    return this.log
  }

  debug(...args: any[]) {
    if (this.debugMode) console.debug('DEBUG: ', ...args)
  }
}

type LoggerImpl = StdoutLogger

export class LoggerService extends Context.Tag('LoggerService')<
  LoggerService,
  LoggerImpl
>() {}

export const LoggerServiceLive = Layer.effect(
  LoggerService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    return new StdoutLogger(config.debugMode)
  }),
)
