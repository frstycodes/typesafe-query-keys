export const Logs = {
  stoppingWatcher: '🛑 Stopping watcher...\n',
  scanningQueryKeys: '🔍 Scanning for query keys...\n',
  watchingForFileChanges: '👀 Watching for file changes...\n',

  generatedQueryKeys: (count: number, duration: number) =>
    `✨ Generated query keys definition in ${duration.toFixed(0)}ms (${count.toLocaleString()} total keys)\n`,
  invalidQkCall: (
    path: string,
    pos: [line: number, char: number],
    argType: string,
  ) =>
    `Invalid qk() call in ${path}:L${pos[0] + 1}:${pos[1] + 1}\n` +
    `Expected: qk("query/key/pattern", {...})\n` +
    `Got: qk() with ${argType}\n` +
    `If you think this is a valid, make sure the first argument to the qk() function is a string literal.`,
}
