export function singleton<Arg, Return>(fn: (...args: Arg[]) => Return) {
  let prevArgs: Arg[]
  let instance: Return | undefined

  return (...args: Arg[]) => {
    if (instance && areSameArgs(prevArgs, args)) return instance
    prevArgs = args
    instance = fn(...args)
    return instance
  }
}

function areSameArgs(prev: any[], next: any[]) {
  if (prev.length !== next.length) return false
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return false
  }
  return true
}
