import { beforeEach, describe, expect, it, vi } from 'vitest'
import { qk } from '../../src/runtime'

describe('Query Keys - Core Functionality', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

    it('should create simple query keys with no parameters', () => {
  describe('Basic query key generation', () => {
      expect(qk('users')).toEqual(['users'])
      expect(qk('settings')).toEqual(['settings'])
    })

    it('should create query keys with parameters', () => {
      let key = qk('users/$userId', { params: { userId: '123' } })
      expect(key).toEqual(['users', '123'])

      key = qk('users/$userId/posts', { params: { userId: 'abc' } })
      expect(key).toEqual(['users', 'abc', 'posts'])
    })

    it('should handle numeric and boolean parameter values', () => {
      let key = qk('users/$userId', { params: { userId: 123 } })
      expect(key).toEqual(['users', '123'])

      key = qk('users/$userId/posts', { params: { userId: 456 } })
      expect(key).toEqual(['users', '456', 'posts'])

      key = qk('posts/$published', { params: { published: true } })
      expect(key).toEqual(['posts', 'true'])

      key = qk('posts/$published', { params: { published: false } })
      expect(key).toEqual(['posts', 'false'])
    })
  })

  describe('Search parameters', () => {
    it('should append search parameters as the last element', () => {
      const key = qk('users', { search: { sort: 'name', order: 'asc' } })

      expect(key).toEqual(['users', { sort: 'name', order: 'asc' }])
    })

    it('should combine path parameters and search parameters', () => {
      const key = qk('users/$userId/posts', {
        params: { userId: 'abc' },
        search: { limit: 10, offset: 0 },
      })

      expect(key).toEqual(['users', 'abc', 'posts', { limit: 10, offset: 0 }])
    })
  })

  describe('Edge cases', () => {
    it('should warn and skip missing parameters', () => {
      const consoleSpy = vi.spyOn(console, 'warn')
      const result = qk('users/$userId', { params: {} as any })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Missing optional parameter: userId',
      )
      expect(result).toEqual(['users'])
    })

    it('should handle empty segments correctly', () => {
      expect(qk('users//posts')).toEqual(['users', '', 'posts'])
    })

    it('should handle empty path', () => {
      expect(qk('')).toEqual([])
    })
  })

  describe('qk.use - strict registered paths', () => {
    it('should create query keys from registered paths', () => {
      const key = qk.use('users/$userId', { params: { userId: '123' } })
      expect(key).toEqual(['users', '123'])
    })

    it('should work with search parameters', () => {
      const key = qk.use('users', { search: { active: true } })
      expect(key).toEqual(['users', { active: true }])
    })
  })
})
