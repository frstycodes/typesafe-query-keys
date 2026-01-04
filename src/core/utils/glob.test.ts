import { describe, it, expect } from 'vitest'
import { globbify } from './glob'

describe('globbify', () => {
  describe('basic pattern matching', () => {
    it('should match exact file paths', () => {
      const glob = globbify(['src/index.ts'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/other.ts')).toBe(false)
    })

    it('should match file & folder names', () => {
      const glob = globbify(['index.ts', 'app'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('app/other.ts')).toBe(true)
    })

    it('should match wildcard patterns', () => {
      const glob = globbify(['src/*.ts'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/utils.ts')).toBe(true)
      expect(glob.matches('src/nested/file.ts')).toBe(false)
    })

    it('should match double-star patterns for nested directories', () => {
      const glob = globbify(['src/**/*.ts'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/utils/helpers.ts')).toBe(true)
      expect(glob.matches('src/deeply/nested/file.ts')).toBe(true)
      expect(glob.matches('other/file.ts')).toBe(false)
    })

    it('should match directory patterns', () => {
      const glob = globbify(['src/**'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/utils/helpers.ts')).toBe(true)
      expect(glob.matches('other/file.ts')).toBe(false)
    })
  })

  describe('multiple patterns', () => {
    it('should match if any pattern matches', () => {
      const glob = globbify(['src/**/*.ts', 'test/**/*.test.ts'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('test/unit.test.ts')).toBe(true)
      expect(glob.matches('other/file.ts')).toBe(false)
    })

    it('should handle multiple directory patterns', () => {
      const glob = globbify(['src/**', 'lib/**', 'dist/**'])

      expect(glob.matches('src/file.ts')).toBe(true)
      expect(glob.matches('lib/module.js')).toBe(true)
      expect(glob.matches('dist/bundle.js')).toBe(true)
      expect(glob.matches('other/file.ts')).toBe(false)
    })
  })

  describe('brace expansion', () => {
    it('should expand brace patterns', () => {
      const glob = globbify(['src/**/*.{ts,tsx}'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/Component.tsx')).toBe(true)
      expect(glob.matches('src/utils.js')).toBe(false)
    })

    it('should expand multiple braces', () => {
      const glob = globbify(['src/**/*.{ts,tsx,js,jsx}'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/Component.tsx')).toBe(true)
      expect(glob.matches('src/utils.js')).toBe(true)
      expect(glob.matches('src/Component.jsx')).toBe(true)
      expect(glob.matches('src/styles.css')).toBe(false)
    })

    it('should expand numeric ranges in braces', () => {
      const glob = globbify(['file{1..3}.ts'])

      expect(glob.matches('file1.ts')).toBe(true)
      expect(glob.matches('file2.ts')).toBe(true)
      expect(glob.matches('file3.ts')).toBe(true)
      expect(glob.matches('file4.ts')).toBe(false)
    })
  })

  describe('common use cases', () => {
    it('should match test files', () => {
      const glob = globbify(['src/**/*.test.ts'])

      expect(glob.matches('src/index.test.ts')).toBe(true)
      expect(glob.matches('src/utils/helper.test.ts')).toBe(true)
      expect(glob.matches('src/index.ts')).toBe(false)
      expect(glob.matches('src/utils.ts')).toBe(false)
    })

    it('should match node_modules paths', () => {
      const glob = globbify(['**/node_modules/**'])

      expect(glob.matches('node_modules/package/index.ts')).toBe(true)
      expect(glob.matches('src/node_modules/local/file.ts')).toBe(true)
      expect(glob.matches('src/index.ts')).toBe(false)
    })

    it('should match specific file types in directories', () => {
      const glob = globbify(['src/**/*.{ts,tsx}'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/Component.tsx')).toBe(true)
      expect(glob.matches('src/index.test.ts')).toBe(true)
      expect(glob.matches('src/Component.test.tsx')).toBe(true)
      expect(glob.matches('src/styles.css')).toBe(false)
    })

    it('should handle hidden files and directories', () => {
      const glob = globbify(['**/*', '**/.*'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('.git/config')).toBe(true)
      expect(glob.matches('src/.hidden')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty patterns array', () => {
      const glob = globbify([])

      expect(glob.matches('src/index.ts')).toBe(false)
      expect(glob.matches('any/file.ts')).toBe(false)
    })

    it('should handle single character wildcards', () => {
      const glob = globbify(['file?.ts'])

      expect(glob.matches('file1.ts')).toBe(true)
      expect(glob.matches('fileA.ts')).toBe(true)
      expect(glob.matches('file12.ts')).toBe(false)
      expect(glob.matches('file.ts')).toBe(false)
    })

    it('should preserve original patterns', () => {
      const patterns = ['src/**/*.ts', 'test/**/*.test.ts']
      const glob = globbify(patterns)

      expect(glob.patterns).toEqual(['src/**/*.ts', 'test/**/*.test.ts'])
    })
  })

  describe('complex scenarios', () => {
    it('should handle realistic TypeScript project patterns', () => {
      const glob = globbify(['**/*.{ts,tsx}'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('src/components/Button.tsx')).toBe(true)
      expect(glob.matches('src/index.test.ts')).toBe(true)
      expect(glob.matches('src/Button.spec.tsx')).toBe(true)
      expect(glob.matches('node_modules/package/index.ts')).toBe(true)
      expect(glob.matches('dist/bundle.js')).toBe(false)
    })

    it('should handle multiple inclusion patterns', () => {
      const glob = globbify(['src/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'])

      expect(glob.matches('src/index.ts')).toBe(true)
      expect(glob.matches('lib/utils.tsx')).toBe(true)
      expect(glob.matches('src/index.test.ts')).toBe(true)
      expect(glob.matches('test/unit.test.ts')).toBe(false)
    })
  })
})
