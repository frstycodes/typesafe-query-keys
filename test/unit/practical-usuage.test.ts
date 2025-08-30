import { describe, it, expect } from 'vitest'
import { qk } from '../../src/query-keys'

// Extend RegisteredPaths with a realistic API structure
declare module '../../src/query-keys' {
  interface Register {
    patterns: [
      'users/$userId/profile',
      'users/$userId',
      'users',
      'posts',
      'posts/$postId',
      'posts/trending',
      'users/$userId/posts',
      'comments/$commentId',
      'posts/$postId/comments',
      'organizations/$orgId/teams/$teamId/members',
    ]
  }
}

describe('Query Keys - Practical Usage', () => {
  describe('Tanstack Query key pattern', () => {
    it('should model typical query key patterns', () => {
      // List resources
      expect(qk.use('users')).toEqual(['users'])

      // Get single resource
      expect(
        qk.use('users/$userId', { params: { userId: 'user123' } }),
      ).toEqual(['users', 'user123'])

      // Get nested resources
      expect(
        qk.use('users/$userId/posts', { params: { userId: 'user123' } }),
      ).toEqual(['users', 'user123', 'posts'])

      // Get nested resource with filters
      expect(
        qk.use('users/$userId/posts', {
          params: { userId: 'user123' },
          search: { status: 'published' },
        }),
      ).toEqual(['users', 'user123', 'posts', { status: 'published' }])
    })

    it('should support complex nested resources', () => {
      const queryKey = qk.use('organizations/$orgId/teams/$teamId/members', {
        params: {
          orgId: 'org123',
          teamId: 'team456',
        },
        search: {
          role: 'admin',
          active: true,
        },
      })

      expect(queryKey).toEqual([
        'organizations',
        'org123',
        'teams',
        'team456',
        'members',
        { role: 'admin', active: true },
      ])
    })
  })

  describe('Using with TanStack Query (simulation)', () => {
    it('should demonstrate usage in query functions', () => {
      // Simulating a React Query useQuery hook
      function simulateUseQuery(
        queryKey: unknown[],
        queryFn: () => Promise<unknown>,
      ) {
        return { queryKey, queryFn }
      }

      // Creating a query using the query keys
      const userQuery = simulateUseQuery(
        qk.use('users/$userId', { params: { userId: 'user123' } }),
        () => Promise.resolve({ id: 'user123', name: 'John Doe' }),
      )

      expect(userQuery.queryKey).toEqual(['users', 'user123'])
    })
  })
})
