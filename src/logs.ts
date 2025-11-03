export const Logs = {
  stoppingWatcher: '\u{1F6D1} Stopping watcher...\n',
  scanningQueryKeys: '\u{1F50D} Scanning for query keys...\n',
  watchingForFileChanges: '\u{1F680} Watching for file changes...\n',

  generatedQueryKeys: (count: number, duration: number) =>
    `\u2728 Generated ${count.toLocaleString()} query keys in ${duration.toFixed(0)}ms\n`,
  errorLoadingConfig: (error: any) =>
    `\u274C Error loading configuration: ${error}\n`,
  failedToReadFile: (path: string, error: any) =>
    `\u274C Failed to read file ${path}: ${error}\n`,
}
