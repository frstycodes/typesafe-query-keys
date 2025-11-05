import '../src/runtime'

declare module '../src/runtime' {
  interface Register {
    queryKeys: [
      'organizations/$orgId/teams/$teamId/members',
      'users',
      'users/$userId',
      'users/$userId/posts',
      'posts',
      'posts/$postId',
      'comments',
      'comments/$commentId',
    ]
  }
}
