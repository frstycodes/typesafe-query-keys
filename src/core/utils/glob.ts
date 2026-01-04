import ignore from 'ignore'
import micromatch from 'micromatch'

export interface Globbify {
  /**
   * Determines if a given path matches any of the glob patterns.
   * @param path - The file path to test against the patterns
   * @returns true if the path matches any of the patterns, false otherwise
   */
  matches: (path: string) => boolean
  patterns: string[]
}

export function globbify(patterns: string[]): Globbify {
  const expanded = patterns.flatMap((p) =>
    micromatch.braces(p, { expand: true }),
  )
  const ig = ignore().add(expanded)

  return {
    patterns,
    matches: (pathname: string) => ig.ignores(pathname),
  }
}
