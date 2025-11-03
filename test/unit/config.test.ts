import { describe, expect, it } from 'vitest'
import { Config } from '../../src/config/schema.config'

describe('Config Schema', () => {
  describe('Config validation', () => {
    it('should parse valid config with defaults', async () => {
      const input = {}
      const result = await Config.parseAsync(input)

      expect(result.functionNames).toContain('qk')
      expect(result.respectGitIgnore).toBe(true)
      expect(result.verbose).toBe(false)
      expect(result.outputPath).toBe('.generated/query-keys.d.ts')
    })

    it('should override defaults with provided values', async () => {
      const input = {
        functionNames: ['customQK'],
        verbose: true,
        outputPath: 'custom/path.d.ts',
        respectGitIgnore: false,
      }

      const result = await Config.parseAsync(input)

      expect(result.functionNames).toEqual(['customQK', 'qk'])
      expect(result.verbose).toBe(true)
      expect(result.outputPath).toBe('custom/path.d.ts')
      expect(result.respectGitIgnore).toBe(false)
    })

    it('should handle include and exclude patterns', async () => {
      const input = {
        include: ['src/**/*.ts'],
        exclude: ['**/*.test.ts', '**/*.spec.ts'],
      }

      const result = await Config.parseAsync(input)

      expect(Array.isArray(result.include)).toBe(true)
      expect(Array.isArray(result.exclude)).toBe(true)
    })
  })
})
