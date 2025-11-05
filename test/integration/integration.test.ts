import { describe, expect, it } from 'vitest'
import { qk } from '../../src/runtime'

describe('Integration Tests', () => {
  describe('Core Runtime Integration', () => {
    it('should handle complete query key patterns', () => {
      // Test basic path
      expect(qk('users')).toEqual(['users'])

      // Test path with parameters
      expect(qk('users/$userId', { params: { userId: 'user123' } })).toEqual([
        'users',
        'user123',
      ])

      // Test nested path with parameters
      expect(
        qk('users/$userId/posts', { params: { userId: 'user123' } }),
      ).toEqual(['users', 'user123', 'posts'])

      // Test with search parameters
      expect(
        qk('users/$userId/posts', {
          params: { userId: 'user123' },
          search: { limit: 10, offset: 0 },
        }),
      ).toEqual(['users', 'user123', 'posts', { limit: 10, offset: 0 }])
    })

    it('should handle qk.use with registered paths', () => {
      // Test basic registered path
      expect(qk.use('users')).toEqual(['users'])

      // Test registered path with parameters
      expect(qk.use('users/$userId', { params: { userId: 'abc123' } })).toEqual(
        ['users', 'abc123'],
      )

      // Test complex registered path
      expect(
        qk.use('users/$userId/posts', {
          params: { userId: 'abc123' },
          search: { status: 'published', sort: 'date' },
        }),
      ).toEqual([
        'users',
        'abc123',
        'posts',
        { status: 'published', sort: 'date' },
      ])
    })

    it('should handle various parameter types correctly', () => {
      // String parameters
      expect(qk('posts/$postId', { params: { postId: 'post-123' } })).toEqual([
        'posts',
        'post-123',
      ])

      // Numeric parameters (converted to string)
      expect(qk('posts/$postId', { params: { postId: 42 } })).toEqual([
        'posts',
        '42',
      ])

      // Boolean parameters (converted to string)
      expect(qk('posts/$published', { params: { published: true } })).toEqual([
        'posts',
        'true',
      ])
    })

    it('should demonstrate real-world usage patterns', () => {
      // Simulate typical TanStack Query usage
      const getUserKey = (userId: string) =>
        qk.use('users/$userId', { params: { userId } })

      const getUserPostsKey = (userId: string, options?: { limit?: number }) =>
        qk.use('users/$userId/posts', {
          params: { userId },
          search: options || {},
        })

      // Test the usage
      expect(getUserKey('user123')).toEqual(['users', 'user123'])

      expect(getUserPostsKey('user123', { limit: 5 })).toEqual([
        'users',
        'user123',
        'posts',
        { limit: 5 },
      ])

      expect(getUserPostsKey('user123')).toEqual(['users', 'user123', 'posts'])
    })
  })
})
