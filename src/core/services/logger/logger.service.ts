import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ConfigService } from '../config/config.service'

class StdoutLogger {
  constructor(private debugMode: boolean) {}

  fatal(message: string, error?: any): never {
    console.error(this.colorize('[FATAL]', 'bgRedWhite'), message)
    if (error) console.error(error)
    process.exit(1)
  }

  error(message: string, error?: any) {
    console.error(this.colorize('[ERROR]', 'red'), message)
    if (error && this.debugMode) console.error(error)
  }

  warn(message: string, error?: any) {
    console.warn(this.colorize('[WARN]', 'yellow'), message)
    if (error && this.debugMode) console.warn(error)
  }

  log(...args: any[]) {
    console.log(...args)
  }

  info(...args: any[]) {
    return console.log(this.colorize('[INFO]', 'blue'), ...args)
  }

  debug(...args: any[]) {
    if (this.debugMode)
      console.debug(this.colorize('[DEBUG]', 'green'), ...args)
  }

  private colorize(
    text: string,
    color: 'red' | 'green' | 'yellow' | 'blue' | 'bgRedWhite',
  ): string {
    const colors: Record<string, string> = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[36m',
      bgRedWhite: '\x1b[41m\x1b[37m',
    }
    const reset = '\x1b[0m'
    return `${colors[color]}${text}${reset}`
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
