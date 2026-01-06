import { describe, it, expect } from 'vitest'
import { enrichKeysWithParents } from './query-keys'

describe('Query Keys utilities', () => {
  describe('enrichKeysWithParents', () => {
    it('should include original keys', () => {
      const keys = ['users.profile.settings']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users.profile.settings')).toBe(true)
    })

    it('should add parent paths', () => {
      const keys = ['users.profile.settings']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('users.profile')).toBe(true)
      expect(result.has('users.profile.settings')).toBe(true)
    })

    it('should handle multiple keys', () => {
      const keys = ['users.profile', 'posts.comments']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('users.profile')).toBe(true)
      expect(result.has('posts')).toBe(true)
      expect(result.has('posts.comments')).toBe(true)
    })

    it('should handle single segment keys', () => {
      const keys = ['users']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.size).toBe(1)
    })

    it('should deduplicate parent paths', () => {
      const keys = ['users.profile.settings', 'users.profile.avatar']
      const result = enrichKeysWithParents(keys)

      // Should not duplicate 'users' or 'users/profile'
      const resultArray = Array.from(result)
      const usersCount = resultArray.filter((k) => k === 'users').length
      const usersProfileCount = resultArray.filter(
        (k) => k === 'users.profile',
      ).length

      expect(usersCount).toBe(1)
      expect(usersProfileCount).toBe(1)
    })

    it('should handle empty array', () => {
      const result = enrichKeysWithParents([])
      expect(result.size).toBe(0)
    })

    it('should handle deeply nested paths', () => {
      const keys = ['a.b.c.d.e.f']
      const result = enrichKeysWithParents(keys)

      expect(result.has('a')).toBe(true)
      expect(result.has('a.b')).toBe(true)
      expect(result.has('a.b.c')).toBe(true)
      expect(result.has('a.b.c.d')).toBe(true)
      expect(result.has('a.b.c.d.e')).toBe(true)
      expect(result.has('a.b.c.d.e.f')).toBe(true)
    })

    it('should handle paths with parameters', () => {
      const keys = ['users.$userId.posts.$postId']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('users.$userId')).toBe(true)
      expect(result.has('users.$userId.posts')).toBe(true)
      expect(result.has('users.$userId.posts.$postId')).toBe(true)
    })

    it('should not add the leaf itself as a parent', () => {
      const keys = ['users.profile']
      const result = enrichKeysWithParents(keys)

      // 'users/profile' should be in the result but only from original keys
      // Not counted as a parent of itself
      expect(result.size).toBe(2) // 'users' and 'users/profile'
    })

    it('should handle duplicate input keys', () => {
      const keys = ['users.profile', 'users.profile']
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('users.profile')).toBe(true)
      expect(result.size).toBe(2)
    })

    it('should handle keys with different depths', () => {
      const keys = ['a', 'a.b', 'a.b.c', 'x.y']
      const result = enrichKeysWithParents(keys)

      expect(result.has('a')).toBe(true)
      expect(result.has('a.b')).toBe(true)
      expect(result.has('a.b.c')).toBe(true)
      expect(result.has('x')).toBe(true)
      expect(result.has('x.y')).toBe(true)
    })

    it('should handle many keys efficiently', () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `key${i}.sub${i}`)
      const result = enrichKeysWithParents(keys)

      // Each key generates 1 parent, so 1000 keys + 1000 parents
      expect(result.size).toBe(2000)
    })

    it('should handle real-world API paths', () => {
      const keys = [
        'users',
        'users.$userId',
        'users.$userId.posts',
        'users.$userId.posts.$postId',
        'organizations.$orgId.teams.$teamId.members',
      ]

      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('users.$userId')).toBe(true)
      expect(result.has('users.$userId.posts')).toBe(true)
      expect(result.has('users.$userId.posts.$postId')).toBe(true)
      expect(result.has('organizations')).toBe(true)
      expect(result.has('organizations.$orgId')).toBe(true)
      expect(result.has('organizations.$orgId.teams')).toBe(true)
      expect(result.has('organizations.$orgId.teams.$teamId')).toBe(true)
      expect(result.has('organizations.$orgId.teams.$teamId.members')).toBe(
        true,
      )
    })

    it('should handle special characters in paths', () => {
      const keys = ['api.v2.users-list']
      const result = enrichKeysWithParents(keys)

      expect(result.has('api')).toBe(true)
      expect(result.has('api.v2')).toBe(true)
      expect(result.has('api.v2.users-list')).toBe(true)
    })

    it('should handle empty string segments', () => {
      const keys = ['a..b']
      const result = enrichKeysWithParents(keys)

      expect(result.has('a')).toBe(true)
      expect(result.has('a.')).toBe(true)
      expect(result.has('a..b')).toBe(true)
    })

    it('should return a Set (not an array)', () => {
      const keys = ['users.profile']
      const result = enrichKeysWithParents(keys)

      expect(result).toBeInstanceOf(Set)
    })

    it('should handle readonly array input', () => {
      const keys: readonly string[] = ['users', 'posts'] as const
      const result = enrichKeysWithParents(keys)

      expect(result.has('users')).toBe(true)
      expect(result.has('posts')).toBe(true)
    })
  })
})
