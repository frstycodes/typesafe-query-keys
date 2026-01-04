export function singleton<Return, Args extends any[]>(
  f: (...args: Args) => Return,
) {
  let instance: Return | undefined
  return (...args: Args) => (instance ??= f(...args))
}
