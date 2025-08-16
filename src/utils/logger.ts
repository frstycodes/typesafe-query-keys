type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Creates a logger function with configurable verbosity.
 * @param verbose When true, all log levels will be displayed. When false, only warn and error logs are displayed.
 * @param showTimestamp When true, each log message will include a timestamp.
 * @returns A logger function that takes a log level and messages to log.
 */
export function createLogger(
  verbose: boolean,
  showTimestamp: boolean,
): (logLevel: LogLevel, ...messages: any[]) => void {
  return (logLevel: LogLevel, ...messages: any[]): void => {
    if (!verbose && (logLevel === "debug" || logLevel === "info")) {
      return;
    }

    const timestamp = showTimestamp ? new Date().toISOString() : "";
    const prefix = `[${timestamp}] [${logLevel.toUpperCase()}]`;

    switch (logLevel) {
      case "debug":
        console.debug(prefix, ...messages);
        break;
      case "info":
        console.info(prefix, ...messages);
        break;
      case "warn":
        console.warn(prefix, ...messages);
        break;
      case "error":
        console.error(prefix, ...messages);
        break;
      default:
        console.log(prefix, ...messages);
    }
  };
}
