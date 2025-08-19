import { describe, it, expect } from 'vitest'
import { qk } from '../../src/query-keys'

// Extend RegisteredPaths with a realistic API structure
declare module '../../src/query-keys' {
  interface RegisteredPaths {
    // User paths
    'users/$userId/profile': true
    'users/$userId': true
    users: true

    // Post paths
    posts: true
    'posts/$postId': true
    'posts/trending': true
    'users/$userId/posts': true

    // Comment paths
    'comments/$commentId': true
    'posts/$postId/comments': true

    // Nested paths with multiple parameters
    'organizations/$orgId/teams/$teamId/members': true
  }
}

describe('Query Keys - Practical Usage', () => {
  describe('RESTful API patterns', () => {
    it('should model typical RESTful resource patterns', () => {
      // List resources
      expect(qk('users')).toEqual(['users'])

      // Get single resource
      expect(qk('users/$userId', { params: { userId: 'user123' } })).toEqual([
        'users',
        'user123',
      ])

      // Get nested resources
      expect(
        qk('users/$userId/posts', { params: { userId: 'user123' } }),
      ).toEqual(['users', 'user123', 'posts'])

      // Get nested resource with filters
      expect(
        qk('users/$userId/posts', {
          params: { userId: 'user123' },
          search: { status: 'published' },
        }),
      ).toEqual(['users', 'user123', 'posts', { status: 'published' }])
    })

    it('should support complex nested resources', () => {
      const queryKey = qk('organizations/$orgId/teams/$teamId/members', {
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
        qk('users/$userId', { params: { userId: 'user123' } }),
        () => Promise.resolve({ id: 'user123', name: 'John Doe' }),
      )

      expect(userQuery.queryKey).toEqual(['users', 'user123'])
    })
  })
})
