import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { pathToQueryKey } from './path-to-query-key'

describe('pathToQueryKey utility', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should convert simple path to array', () => {
      const result = pathToQueryKey('users', {})
      expect(result).toEqual(['users'])
    })

    it('should handle empty path', () => {
      const result = pathToQueryKey('', {})
      expect(result).toEqual([])
    })

    it('should split path by slashes', () => {
      const result = pathToQueryKey('users.posts.comments', {})
      expect(result).toEqual(['users', 'posts', 'comments'])
    })

    it('should handle single segment', () => {
      const result = pathToQueryKey('users', {})
      expect(result).toEqual(['users'])
    })

    it('should preserve empty segments', () => {
      const result = pathToQueryKey('users..posts', {})
      expect(result).toEqual(['users', '', 'posts'])
    })
  })

  describe('Parameter substitution', () => {
    it('should substitute single parameter', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '123' },
      })
      expect(result).toEqual(['users', '123'])
    })

    it('should substitute multiple parameters', () => {
      const result = pathToQueryKey('users.$userId.posts.$postId', {
        params: { userId: '123', postId: '456' },
      })
      expect(result).toEqual(['users', '123', 'posts', '456'])
    })

    it('should substitute consecutive parameters', () => {
      const result = pathToQueryKey('$orgId.$userId', {
        params: { orgId: 'org1', userId: 'user1' },
      })
      expect(result).toEqual(['org1', 'user1'])
    })

    it('should substitute parameter at end', () => {
      const result = pathToQueryKey('users.posts.$postId', {
        params: { postId: '999' },
      })
      expect(result).toEqual(['users', 'posts', '999'])
    })

    it('should substitute parameter at start', () => {
      const result = pathToQueryKey('$userId.posts', {
        params: { userId: 'abc' },
      })
      expect(result).toEqual(['abc', 'posts'])
    })

    it('should handle single parameter path', () => {
      const result = pathToQueryKey('$id', { params: { id: '123' } })
      expect(result).toEqual(['123'])
    })
  })

  describe('Type coercion', () => {
    it('should convert numbers to strings', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: 42 },
      })
      expect(result).toEqual(['users', '42'])
      expect(typeof result[1]).toBe('string')
    })

    it('should convert booleans to strings', () => {
      const result = pathToQueryKey('settings.$enabled', {
        params: { enabled: true },
      })
      expect(result).toEqual(['settings', 'true'])
      expect(typeof result[1]).toBe('string')
    })

    it('should convert false to string', () => {
      const result = pathToQueryKey('settings.$enabled', {
        params: { enabled: false },
      })
      expect(result).toEqual(['settings', 'false'])
    })

    it('should convert zero to string', () => {
      const result = pathToQueryKey('page.$num', { params: { num: 0 } })
      expect(result).toEqual(['page', '0'])
    })

    it('should handle negative numbers', () => {
      const result = pathToQueryKey('offset.$value', {
        params: { value: -5 },
      })
      expect(result).toEqual(['offset', '-5'])
    })

    it('should handle floating point numbers', () => {
      const result = pathToQueryKey('price.$amount', {
        params: { amount: 19.99 },
      })
      expect(result).toEqual(['price', '19.99'])
    })
  })

  describe('Trimming behavior', () => {
    it('should trim segment whitespace', () => {
      const result = pathToQueryKey('users . posts', {})
      expect(result).toEqual(['users', 'posts'])
    })

    it('should trim parameter values', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '  123  ' },
      })
      expect(result).toEqual(['users', '123'])
    })

    it('should trim whitespace from static segments', () => {
      const result = pathToQueryKey(' users . posts ', {})
      expect(result).toEqual(['users', 'posts'])
    })

    it('should handle tabs and newlines', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '\t123\n' },
      })
      expect(result).toEqual(['users', '123'])
    })
  })

  describe('Search parameters', () => {
    it('should append search object as last element', () => {
      const result = pathToQueryKey('users', {
        search: { active: true },
      })
      expect(result).toEqual(['users', { active: true }])
    })

    it('should append search after path segments', () => {
      const result = pathToQueryKey('users.posts', {
        search: { limit: 10 },
      })
      expect(result).toEqual(['users', 'posts', { limit: 10 }])
    })

    it('should append search after substituted parameters', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '123' },
        search: { include: 'profile' },
      })
      expect(result).toEqual(['users', '123', { include: 'profile' }])
    })

    it('should handle empty search object', () => {
      const result = pathToQueryKey('users', { search: {} })
      expect(result).toEqual(['users', {}])
    })

    it('should handle complex search objects', () => {
      const search = {
        filters: { status: 'active' },
        pagination: { page: 1, limit: 20 },
      }
      const result = pathToQueryKey('users', { search })
      expect(result).toEqual(['users', search])
    })

    it('should not append search if undefined', () => {
      const result = pathToQueryKey('users', { search: undefined })
      expect(result).toEqual(['users'])
    })
  })

  describe('Missing parameters', () => {
    it('should skip missing parameter segments', () => {
      const result = pathToQueryKey('users.$userId.posts', {
        params: {},
      })
      expect(result).toEqual(['users', 'posts'])
    })

    it('should skip partially missing parameters', () => {
      const result = pathToQueryKey('users.$userId.posts.$postId', {
        params: { userId: '123' },
      })
      expect(result).toEqual(['users', '123', 'posts'])
    })

    it('should handle all missing parameters', () => {
      const result = pathToQueryKey('$a.$b.$c', { params: {} })
      expect(result).toEqual([])
    })

    it('should not throw on missing parameters', () => {
      expect(() => {
        pathToQueryKey('users.$userId', { params: {} })
      }).not.toThrow()
    })

    it('should handle missing parameters gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = pathToQueryKey('users.$userId', { params: {} })

      expect(result).toEqual(['users'])
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should handle multiple missing parameters', () => {
      const result = pathToQueryKey('users.$userId.posts.$postId', {
        params: {},
      })

      expect(result).toEqual(['users', 'posts'])
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined params', () => {
      const result = pathToQueryKey('users', { params: undefined })
      expect(result).toEqual(['users'])
    })

    it('should handle null params', () => {
      const result = pathToQueryKey('users', { params: null as any })
      expect(result).toEqual(['users'])
    })

    it('should handle empty string parameter value', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '' },
      })
      expect(result).toEqual(['users', ''])
    })

    it('should handle parameters with special characters', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: 'user-123_abc' },
      })
      expect(result).toEqual(['users', 'user-123_abc'])
    })

    it('should ignore extra parameters not in path', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '123', extra: 'ignored' },
      })
      expect(result).toEqual(['users', '123'])
    })

    it('should not substitute $ in middle of segment', () => {
      const result = pathToQueryKey('users.user$id', {
        params: { id: '123' },
      })
      expect(result).toEqual(['users', 'user$id'])
    })

    it('should not substitute $ at end of segment', () => {
      const result = pathToQueryKey('users.id$', { params: {} })
      expect(result).toEqual(['users', 'id$'])
    })

    it('should handle paths with leading slash', () => {
      const result = pathToQueryKey('.users.posts', {})
      expect(result).toEqual(['', 'users', 'posts'])
    })

    it('should handle paths with trailing slash', () => {
      const result = pathToQueryKey('users.posts.', {})
      expect(result).toEqual(['users', 'posts', ''])
    })

    it('should handle multiple consecutive slashes', () => {
      const result = pathToQueryKey('users...posts', {})
      expect(result).toEqual(['users', '', '', 'posts'])
    })

    it('should handle empty options object', () => {
      const result = pathToQueryKey('users', {})
      expect(result).toEqual(['users'])
    })
  })

  describe('Complex real-world scenarios', () => {
    it('should handle nested resource paths with multiple params', () => {
      const result = pathToQueryKey(
        'organizations.$orgId.teams.$teamId.members.$memberId',
        {
          params: {
            orgId: 'acme-corp',
            teamId: 'engineering',
            memberId: 'john-doe',
          },
        },
      )
      expect(result).toEqual([
        'organizations',
        'acme-corp',
        'teams',
        'engineering',
        'members',
        'john-doe',
      ])
    })

    it('should handle versioned API paths', () => {
      const result = pathToQueryKey('v2.users.$userId.profile', {
        params: { userId: '123' },
      })
      expect(result).toEqual(['v2', 'users', '123', 'profile'])
    })

    it('should handle pagination with search', () => {
      const result = pathToQueryKey('posts', {
        search: {
          page: 1,
          limit: 20,
          sort: 'createdAt',
          order: 'desc',
        },
      })
      expect(result).toEqual([
        'posts',
        { page: 1, limit: 20, sort: 'createdAt', order: 'desc' },
      ])
    })

    it('should handle filtered lists with params and search', () => {
      const result = pathToQueryKey('users.$userId.posts', {
        params: { userId: '123' },
        search: {
          status: 'published',
          tags: ['tech', 'news'],
        },
      })
      expect(result).toEqual([
        'users',
        '123',
        'posts',
        { status: 'published', tags: ['tech', 'news'] },
      ])
    })

    it('should handle infinite query cursors', () => {
      const result = pathToQueryKey('feed', {
        search: {
          cursor: 'eyJpZCI6MTIzfQ==',
          limit: 10,
        },
      })
      expect(result).toEqual([
        'feed',
        { cursor: 'eyJpZCI6MTIzfQ==', limit: 10 },
      ])
    })

    it('should handle mutation endpoints', () => {
      const result = pathToQueryKey('users.$userId.update', {
        params: { userId: '456' },
      })
      expect(result).toEqual(['users', '456', 'update'])
    })

    it('should handle deeply nested params', () => {
      const result = pathToQueryKey('a.$b.c.$d.e.$f.g.$h', {
        params: { b: '1', d: '2', f: '3', h: '4' },
      })
      expect(result).toEqual(['a', '1', 'c', '2', 'e', '3', 'g', '4'])
    })

    it('should handle snake_case parameter names', () => {
      const result = pathToQueryKey('users.$user_id.posts.$post_id', {
        params: { user_id: '123', post_id: '456' },
      })
      expect(result).toEqual(['users', '123', 'posts', '456'])
    })

    it('should handle camelCase parameter names', () => {
      const result = pathToQueryKey('users.$currentUserId', {
        params: { currentUserId: '123' },
      })
      expect(result).toEqual(['users', '123'])
    })

    it('should handle UUID parameters', () => {
      const result = pathToQueryKey('users.$userId', {
        params: { userId: '550e8400-e29b-41d4-a716-446655440000' },
      })
      expect(result).toEqual(['users', '550e8400-e29b-41d4-a716-446655440000'])
    })
  })

  describe('Performance and memory', () => {
    it('should handle long paths efficiently', () => {
      const segments = Array.from({ length: 100 }, (_, i) => `segment${i}`)
      const path = segments.join('.')
      const result = pathToQueryKey(path, {})
      expect(result).toHaveLength(100)
      expect(result[0]).toBe('segment0')
      expect(result[99]).toBe('segment99')
    })

    it('should handle many parameters efficiently', () => {
      const path = Array.from({ length: 50 }, (_, i) => `$param${i}`).join('.')
      const params = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`param${i}`, `value${i}`]),
      )
      const result = pathToQueryKey(path, { params })
      expect(result).toHaveLength(50)
      expect(result[0]).toBe('value0')
      expect(result[49]).toBe('value49')
    })

    it('should not mutate input options', () => {
      const options = {
        params: { userId: '123' },
        search: { active: true },
      }
      const optionsCopy = JSON.parse(JSON.stringify(options))

      pathToQueryKey('users.$userId', options)

      expect(options).toEqual(optionsCopy)
    })
  })
})
