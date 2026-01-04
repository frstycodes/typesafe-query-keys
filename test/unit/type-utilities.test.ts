import { describe, it, expect, assertType } from 'vitest'
import {
  type ExtractParamsFromKey,
  type HasParams,
  type ParamValue,
} from '../../src/runtime/types/params.types'
import type { Options } from '../../src/runtime/types/options.types'

describe('Query Keys - Type Utilities', () => {
  describe('ExtractParamsFromKey', () => {
    it('should extract single parameter', () => {
      type UserParams = ExtractParamsFromKey<'users/$userId'>
      const params: UserParams = { userId: '123' }

      // These assertions verify the type structure at runtime
      expect(Object.keys(params)).toContain('userId')
      expect(params.userId).toBe('123')

      // The following would cause TypeScript errors if uncommented:
      // const invalid: UserParams = {}; // Missing required userId
      // const invalid2: UserParams = { userId: "123", extra: true }; // Extra property
    })

    it('should extract multiple parameters', () => {
      type PostParams = ExtractParamsFromKey<'users/$userId/posts/$postId'>
      const params: PostParams = { userId: 'user1', postId: 'post1' }

      expect(Object.keys(params).sort()).toEqual(['postId', 'userId'])
      expect(params.userId).toBe('user1')
      expect(params.postId).toBe('post1')
    })

    it('should produce empty object for paths without parameters', () => {
      type NoParams = ExtractParamsFromKey<'settings'>
      const params: NoParams = {}

      expect(Object.keys(params).length).toBe(0)
    })

    it('should extract parameters from paths with leading slashes', () => {
      type Params = ExtractParamsFromKey<'/users/$userId'>
      const params: Params = { userId: '123' }

      expect(params.userId).toBe('123')
    })

    it('should extract parameters from paths with trailing slashes', () => {
      type Params = ExtractParamsFromKey<'users/$userId/'>
      const params: Params = { userId: '123' }

      expect(params.userId).toBe('123')
    })

    it('should extract consecutive parameters', () => {
      type Params = ExtractParamsFromKey<'$orgId/$userId'>
      const params: Params = { orgId: 'org1', userId: 'user1' }

      expect(params.orgId).toBe('org1')
      expect(params.userId).toBe('user1')
    })

    it('should extract three or more parameters', () => {
      type Params = ExtractParamsFromKey<'org/$orgId/team/$teamId/user/$userId'>
      const params: Params = {
        orgId: '1',
        teamId: '2',
        userId: '3',
      }

      expect(Object.keys(params).sort()).toEqual(['orgId', 'teamId', 'userId'])
      expect(params.orgId).toBe('1')
      expect(params.teamId).toBe('2')
      expect(params.userId).toBe('3')
    })

    it('should handle complex nested paths', () => {
      type Params = ExtractParamsFromKey<'a/$b/c/$d/e/$f/g'>
      const params: Params = { b: '1', d: '2', f: '3' }

      expect(params.b).toBe('1')
      expect(params.d).toBe('2')
      expect(params.f).toBe('3')
    })

    it('should accept string values', () => {
      type Params = ExtractParamsFromKey<'users/$id'>
      const params: Params = { id: 'abc-123' }

      expect(params.id).toBe('abc-123')
    })

    it('should accept number values', () => {
      type Params = ExtractParamsFromKey<'users/$id'>
      const params: Params = { id: 42 }

      expect(params.id).toBe(42)
    })

    it('should accept boolean values', () => {
      type Params = ExtractParamsFromKey<'settings/$enabled'>
      const params: Params = { enabled: true }

      expect(params.enabled).toBe(true)
    })

    it('should handle single segment parameter', () => {
      type Params = ExtractParamsFromKey<'$id'>
      const params: Params = { id: '123' }

      expect(params.id).toBe('123')
    })

    it('should handle parameter at end of path', () => {
      type Params = ExtractParamsFromKey<'users/posts/$postId'>
      const params: Params = { postId: '999' }

      expect(params.postId).toBe('999')
    })

    it('should handle parameter at start of path', () => {
      type Params = ExtractParamsFromKey<'$userId/posts'>
      const params: Params = { userId: 'abc' }

      expect(params.userId).toBe('abc')
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

    it('should return true for multiple parameters', () => {
      type Result = HasParams<'users/$userId/posts/$postId'>
      const hasParams: Result = true
      expect(hasParams).toBe(true)
    })

    it('should return false for empty path', () => {
      type Result = HasParams<''>
      const hasParams: Result = false
      expect(hasParams).toBe(false)
    })

    it('should return true for single parameter', () => {
      type Result = HasParams<'$id'>
      const hasParams: Result = true
      expect(hasParams).toBe(true)
    })

    it('should return false for paths with $ not at segment start', () => {
      type Result = HasParams<'users/id$'>
      const hasParams: Result = false
      expect(hasParams).toBe(false)
    })

    it('should return true for consecutive parameters', () => {
      type Result = HasParams<'$a/$b'>
      const hasParams: Result = true
      expect(hasParams).toBe(true)
    })

    it('should return false for simple paths', () => {
      type Result1 = HasParams<'users'>
      type Result2 = HasParams<'posts'>
      type Result3 = HasParams<'settings/profile'>

      const r1: Result1 = false
      const r2: Result2 = false
      const r3: Result3 = false

      expect(r1).toBe(false)
      expect(r2).toBe(false)
      expect(r3).toBe(false)
    })
  })

  describe('ParamValue', () => {
    it('should accept string values', () => {
      const value: ParamValue = 'test'
      expect(typeof value).toBe('string')
    })

    it('should accept number values', () => {
      const value: ParamValue = 123
      expect(typeof value).toBe('number')
    })

    it('should accept boolean values', () => {
      const value: ParamValue = true
      expect(typeof value).toBe('boolean')
    })

    it('should accept zero', () => {
      const value: ParamValue = 0
      expect(value).toBe(0)
    })

    it('should accept empty string', () => {
      const value: ParamValue = ''
      expect(value).toBe('')
    })

    it('should accept false', () => {
      const value: ParamValue = false
      expect(value).toBe(false)
    })

    it('should accept negative numbers', () => {
      const value: ParamValue = -42
      expect(value).toBe(-42)
    })

    it('should accept floating point numbers', () => {
      const value: ParamValue = 3.14
      expect(value).toBe(3.14)
    })
  })

  describe('Options type behavior', () => {
    it('should require params for paths with parameters', () => {
      type Opts = Options<'users/$userId'>

      // This should require params
      const opts: Opts = {
        params: { userId: '123' },
      }

      expect(opts.params.userId).toBe('123')
    })

    it('should make params optional for paths without parameters', () => {
      type Opts = Options<'users'>

      // This should not require params
      const opts: Opts = {}

      expect(opts).toEqual({})
    })

    it('should always allow search parameter', () => {
      type OptsWithParams = Options<'users/$userId'>
      type OptsWithoutParams = Options<'users'>

      const opts1: OptsWithParams = {
        params: { userId: '123' },
        search: { active: true },
      }

      const opts2: OptsWithoutParams = {
        search: { active: true },
      }

      expect(opts1.search).toEqual({ active: true })
      expect(opts2.search).toEqual({ active: true })
    })

    it('should handle complex parameter paths', () => {
      type Opts = Options<'org/$orgId/team/$teamId/user/$userId'>

      const opts: Opts = {
        params: { orgId: '1', teamId: '2', userId: '3' },
      }

      expect(opts.params).toEqual({
        orgId: '1',
        teamId: '2',
        userId: '3',
      })
    })

    it('should support params and search together', () => {
      type Opts = Options<'users/$userId/posts'>

      const opts: Opts = {
        params: { userId: '123' },
        search: { limit: 10, offset: 0 },
      }

      expect(opts.params.userId).toBe('123')
      expect(opts.search).toEqual({ limit: 10, offset: 0 })
    })
  })

  describe('Type inference edge cases', () => {
    it('should handle empty string path', () => {
      type Params = ExtractParamsFromKey<''>
      const params: Params = {}

      expect(Object.keys(params).length).toBe(0)
    })

    it('should handle paths with only slashes', () => {
      type Params = ExtractParamsFromKey<'//'>
      const params: Params = {}

      expect(Object.keys(params).length).toBe(0)
    })

    it('should preserve parameter names exactly', () => {
      type Params = ExtractParamsFromKey<'users/$userId_123'>
      const params: Params = { userId_123: 'test' }

      expect(params.userId_123).toBe('test')
    })

    it('should handle camelCase parameter names', () => {
      type Params = ExtractParamsFromKey<'users/$currentUserId'>
      const params: Params = { currentUserId: '123' }

      expect(params.currentUserId).toBe('123')
    })

    it('should handle snake_case parameter names', () => {
      type Params = ExtractParamsFromKey<'users/$user_id'>
      const params: Params = { user_id: '123' }

      expect(params.user_id).toBe('123')
    })

    it('should handle PascalCase parameter names', () => {
      type Params = ExtractParamsFromKey<'users/$UserId'>
      const params: Params = { UserId: '123' }

      expect(params.UserId).toBe('123')
    })

    it('should handle numeric suffix parameter names', () => {
      type Params = ExtractParamsFromKey<'users/$id1/posts/$id2'>
      const params: Params = { id1: '1', id2: '2' }

      expect(params.id1).toBe('1')
      expect(params.id2).toBe('2')
    })
  })

  describe('Options.ParamsOnly', () => {
    it('should extract params for paths with parameters', () => {
      type ParamsOnly = Options.ParamsOnly<'users/$userId'>

      const paramsOnly: ParamsOnly = {
        params: { userId: '123' },
      }

      expect(paramsOnly.params.userId).toBe('123')
    })

    it('should return empty object for paths without parameters', () => {
      type ParamsOnly = Options.ParamsOnly<'users'>

      const paramsOnly: ParamsOnly = {}

      expect(paramsOnly).toEqual({})
    })

    it('should not include search in ParamsOnly', () => {
      type ParamsOnly = Options.ParamsOnly<'users/$userId'>

      // The following would cause a TypeScript error:
      // const invalid: ParamsOnly = {
      //   params: { userId: '123' },
      //   search: { active: true }, // Error: search not in ParamsOnly
      // }

      const valid: ParamsOnly = {
        params: { userId: '123' },
      }

      expect(valid.params.userId).toBe('123')
    })
  })

  describe('Options.Permissive', () => {
    it('should allow any params structure', () => {
      const opts: Options.Permissive = {
        params: { anything: 'goes', here: 123, bool: true },
      }

      expect(opts.params).toBeDefined()
    })

    it('should allow any search structure', () => {
      const opts: Options.Permissive = {
        search: { whatever: 'you', want: [1, 2, 3] },
      }

      expect(opts.search).toBeDefined()
    })

    it('should make both params and search optional', () => {
      const opts: Options.Permissive = {}

      expect(opts).toEqual({})
    })

    it('should allow partial params', () => {
      const opts: Options.Permissive = {
        params: {},
      }

      expect(opts.params).toEqual({})
    })
  })

  describe('Real-world type scenarios', () => {
    it('should handle user detail endpoint types', () => {
      type UserDetailKey = 'users/$userId'
      type UserParams = ExtractParamsFromKey<UserDetailKey>
      type UserOptions = Options<UserDetailKey>

      const params: UserParams = { userId: '123' }
      const options: UserOptions = {
        params: { userId: '123' },
        search: { include: 'profile' },
      }

      expect(params.userId).toBe('123')
      expect(options.params.userId).toBe('123')
      expect(options.search).toEqual({ include: 'profile' })
    })

    it('should handle nested resource types', () => {
      type NestedKey = 'orgs/$orgId/teams/$teamId/members'
      type NestedParams = ExtractParamsFromKey<NestedKey>

      const params: NestedParams = {
        orgId: 'acme-corp',
        teamId: 'engineering',
      }

      expect(params.orgId).toBe('acme-corp')
      expect(params.teamId).toBe('engineering')
    })

    it('should handle list endpoint types', () => {
      type ListKey = 'posts'
      type ListOptions = Options<ListKey>

      const options: ListOptions = {
        search: {
          page: 1,
          limit: 20,
          sort: 'createdAt',
          filter: { status: 'published' },
        },
      }

      expect(options.search).toBeDefined()
    })

    it('should handle infinite query types', () => {
      type InfiniteKey = 'feed'
      type InfiniteOptions = Options<InfiniteKey>

      const options: InfiniteOptions = {
        search: {
          cursor: 'abc123',
          limit: 10,
        },
      }

      expect(options.search).toEqual({ cursor: 'abc123', limit: 10 })
    })

    it('should handle mutation endpoint types', () => {
      type MutationKey = 'users/$userId/update'
      type MutationParams = ExtractParamsFromKey<MutationKey>

      const params: MutationParams = { userId: '456' }

      expect(params.userId).toBe('456')
    })
  })
})
