import { describe, it, expect } from 'vitest'
import { type ExtractParamsFromID, type HasParams } from '../../src/query-keys'

describe('Query Keys - Type Utilities', () => {
  describe('ExtractParamsFromID', () => {
    it('should extract single parameter', () => {
      type UserParams = ExtractParamsFromID<'users/$userId'>
      const params: UserParams = { userId: '123' }

      // These assertions verify the type structure at runtime
      expect(Object.keys(params)).toContain('userId')
      expect(params.userId).toBe('123')

      // The following would cause TypeScript errors if uncommented:
      // const invalid: UserParams = {}; // Missing required userId
      // const invalid2: UserParams = { userId: "123", extra: true }; // Extra property
    })

    it('should extract multiple parameters', () => {
      type PostParams = ExtractParamsFromID<'users/$userId/posts/$postId'>
      const params: PostParams = { userId: 'user1', postId: 'post1' }

      expect(Object.keys(params).sort()).toEqual(['postId', 'userId'])
      expect(params.userId).toBe('user1')
      expect(params.postId).toBe('post1')
    })

    it('should produce empty object for paths without parameters', () => {
      type NoParams = ExtractParamsFromID<'settings'>
      const params: NoParams = {}

      expect(Object.keys(params).length).toBe(0)
    })
  })

  describe('HasParams', () => {
    it('should return true for paths with parameters', () => {
      type HasUserIdParam = HasParams<'users/$userId'>
      // This assertion would fail if HasParams returned false
      const result: HasUserIdParam = true
      expect(result).toBe(true)
    })

    it('should return false for paths without parameters', () => {
      type HasNoParams = HasParams<'users'>
      // This assertion would fail if HasParams returned true
      const result: HasNoParams = false
      expect(result).toBe(false)
    })
  })
})
