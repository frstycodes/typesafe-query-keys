type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log'

export function createLogger(verbose: boolean) {
  return function logger(logLevel: LogLevel, ...messages: any[]) {
    if (!verbose) {
      if (logLevel == 'debug' || logLevel == 'info') return
    }

    const prefix = logLevel !== 'log' ? `[${logLevel.toUpperCase()}]` : ''
    console[logLevel](prefix, ...messages)
  }
}

export type Logger = ReturnType<typeof createLogger>
