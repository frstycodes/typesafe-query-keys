# Typesafe Query Keys

<!-- Package Info -->
[![npm version](https://img.shields.io/npm/v/@frsty/typesafe-query-keys.svg)](https://www.npmjs.com/package/@frsty/typesafe-query-keys)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@frsty/typesafe-query-keys)](https://bundlephobia.com/package/@frsty/typesafe-query-keys)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- Downloads -->
[![npm downloads](https://img.shields.io/npm/dm/@frsty/typesafe-query-keys.svg)](https://www.npmjs.com/package/@frsty/typesafe-query-keys)
[![npm total downloads](https://img.shields.io/npm/dt/@frsty/typesafe-query-keys.svg)](https://www.npmjs.com/package/@frsty/typesafe-query-keys)

<!-- Repository -->
[![CI](https://github.com/frstycodes/typesafe-query-keys/actions/workflows/ci.yml/badge.svg)](https://github.com/frstycodes/typesafe-query-keys/actions/workflows/ci.yml)
[![GitHub Stars](https://img.shields.io/github/stars/frstycodes/typesafe-query-keys.svg?style=social&label=Star)](https://github.com/frstycodes/typesafe-query-keys)

<a href="https://star-history.com/#frstycodes/typesafe-query-keys">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=frstycodes/typesafe-query-keys&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=frstycodes/typesafe-query-keys&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=frstycodes/typesafe-query-keys&type=Date" />
  </picture>
</a>

A framework-agnostic tool that automatically generates TypeScript types for your query keys by scanning your codebase for `qk()` calls.

## Features

- **0.4kb bundle size** - Traditional query key factories add 2-5kb+ per domain
- **Build-time type generation** - Full type safety with zero runtime overhead
- **Framework agnostic** - Works with any JavaScript/TypeScript project
- **Multiple plugins** - Vite, Webpack, and Generic plugins supported
- **Auto-regeneration** - Types update automatically on file changes

## Installation

```bash
npm install @frsty/typesafe-query-keys
```

## Usage

### Vite Plugin
For Vite projects, you can use the the plugin.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import typesafeQueryKeys from "@frsty/typesafe-query-keys/plugin/vite";

export default defineConfig({
  plugins: [
    typesafeQueryKeys({
      rootDir: process.cwd(),
      include: ['src/**/*.queries.ts'],
      exclude: ["**/temp", "**/.tanstack"],
      outputPath: "query-keys.d.ts",
      debugMode: false,
      debounceDelay: 1000,
    }),
  ],
});
```

### Webpack Plugin
For projects that use webpack, you can use the the webpack plugin. e.g. Next.JS

```typescript
// next.config.ts
import { NextConfig } from "next";
import typesafeQueryKeys from "@frsty/typesafe-query-keys/plugin/webpack";

export default {
  webpack: (config) => {
    config.plugins.push(
      typesafeQueryKeys({
        rootDir: process.cwd(),
        include: ['src/**/*.queries.ts'],
        exclude: ["**/temp", "**/.tanstack"],
        outputPath: "query-keys.d.ts",
        debugMode: false,
        debounceDelay: 1000,
      }),
    )
  },
} satisfies NextConfig
```

### Generic Plugin - __DO NOT USE__ if there is a dedicated plugin for your framework
For projects that don't use webpack or vite, you can use the generic plugin.

This is just an example for Next.JS using turbo but for other frameworks, make sure to call this plugin in the node environment, any file that is involved during the development process:

```typescript
// next.config.ts
import { NextConfig } from "next";
import typesafeQueryKeys from "@frsty/typesafe-query-keys/plugin/generic";

typesafeQueryKeys({
  rootDir: process.cwd(),
  include: ['src/**/*.queries.ts'],
  exclude: ["**/temp", "**/.tanstack"],
  outputPath: "query-keys.d.ts",
  debugMode: false,
  debounceDelay: 1000,
})

export default {
  // Next config goes here
} satisfies NextConfig
```

## Plugin Options

| Option       | Type       | Default                 | Description                              |
| ------------ | ---------- | ----------------------- | ---------------------------------------- |
| `rootDir`    | `string`   | `process.cwd()`         | Root directory for resolving relative paths |
| `include`    | `string[]` | `[]`                    | Glob patterns for files to scan          |
| `exclude`    | `string[]` | `["node_modules/"]`     | Glob patterns for files to ignore        |
| `outputPath` | `string`   | `"query-keys.d.ts"`     | Output file path for generated types     |
| `debugMode`  | `boolean`  | `false`                 | Enable detailed logging for debugging    |
| `debounceDelay` | `number` | `1000`                | Debounce delay in ms before re-generation |

## How It Works

The plugin:

1. **Scans your codebase** for `qk()` calls during build and development
2. **Extracts query key patterns** from the first argument of these calls
3. **Generates parent paths** automatically (e.g., `"users/$userId/posts"` also registers `"users"` and `"users/$userId"`)
4. **Watches for file changes** and regenerates types automatically

## Example Usage in Code

```typescript
import { qk } from "@frsty/typesafe-query-keys";
import { useQuery } from "@tanstack/react-query"

// Define a query key pattern
const testQuery = useQuery({
  // This automatically gets registered and generates types for parent paths as well: "users/$userId/posts", "users/$userId", "users"
  queryKey: qk("users.$userId.posts", {
    params: { userId: "123" }
  }),
  queryFn: async () => {
    const response = await fetch(`https://api.example.com/users/${userId}/posts`);
    return response.json();
  }
})

// Use the registered pattern with `qk.use()` (with autocomplete)
const userPostsQK = qk.use("users.$userId.posts", {
  params: { userId: "123" },
});

// Invalidate all user queries
queryClient.invalidateQueries({queryKey: qk.use("users")})
```

## Migration Guide

### From Traditional Query Keys

If you're currently using traditional query key factories or string arrays, here's how to migrate:

#### Before (Traditional Approach)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Manual query key factory
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Usage
function UserProfile({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
  });

  const { mutate } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate manually with factory
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });

  return <div>{data?.name}</div>;
}
```

#### After (With Typesafe Query Keys)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@frsty/typesafe-query-keys";

// No manual factory needed! Just use qk() in your queries
function UserProfile({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    // Pattern automatically registered - types generated at build time
    queryKey: qk("users.$userId", { params: { userId } }),
    queryFn: () => fetchUser(userId),
  });

  const { mutate } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate with autocomplete - no manual factory needed!
      queryClient.invalidateQueries({ 
        queryKey: qk.use("users.$userId", { params: { userId } })
      });
      
      // Or invalidate all user queries
      queryClient.invalidateQueries({ queryKey: qk.use("users") });
    },
  });

  return <div>{data?.name}</div>;
}
```

### Migration Steps

1. **Install the package**:
   ```bash
   npm install @frsty/typesafe-query-keys
   ```

2. **Configure your build tool** (Vite, Webpack, or Generic plugin - see [Usage](#usage))

3. **Replace query key factories** with `qk()` patterns:
   - `['users', userId]` → `qk("users.$userId", { params: { userId } })`
   - `['posts', postId, 'comments']` → `qk("posts.$postId.comments", { params: { postId } })`
   - `['products', { category }]` → `qk("products", { search: { category } })`

4. **Use `qk.use()` for invalidation** - get autocomplete for all registered patterns

5. **Remove manual query key factories** - they're no longer needed!


## Guide for AI Agents

If you're an AI agent helping users implement TanStack Query with this library, follow these patterns:

### Basic Query Pattern

```typescript
import { qk } from "@frsty/typesafe-query-keys";
import { useQuery } from "@tanstack/react-query";

// Simple query without parameters
useQuery({
  queryKey: qk("users"),
  queryFn: fetchUsers,
});

// Query with path parameters
useQuery({
  queryKey: qk("users.$userId", { 
    params: { userId: "123" } 
  }),
  queryFn: () => fetchUser("123"),
});

// Query with search parameters (query strings)
useQuery({
  queryKey: qk("products", { 
    search: { category: "electronics", sort: "price" }
  }),
  queryFn: () => fetchProducts({ category: "electronics", sort: "price" }),
});

// Query with both path and search parameters
useQuery({
  queryKey: qk("users.$userId.posts", {
    params: { userId: "123" },
    search: { status: "published", limit: 10 }
  }),
  queryFn: () => fetchUserPosts("123", { status: "published", limit: 10 }),
});
```

### Mutation Pattern with Invalidation

```typescript
import { qk } from "@frsty/typesafe-query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function UpdateUserForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UserData) => updateUser(userId, data),
    onSuccess: () => {
      // Invalidate specific user
      queryClient.invalidateQueries({
        queryKey: qk.use("users.$userId", { params: { userId } })
      });
      
      // Invalidate all users list
      queryClient.invalidateQueries({
        queryKey: qk.use("users")
      });
    },
  });

  return <form onSubmit={(e) => {
    e.preventDefault();
    mutation.mutate({ name: "New Name" });
  }}>
    {/* form fields */}
  </form>;
}
```

### Pattern Naming Conventions

When helping users choose query key patterns:

1. **Use hierarchical paths**: `"users.$userId.posts.$postId"` not `"user-post"`
2. **Use parameter placeholders**: `$userId`, `$postId`, `$id` for dynamic segments
3. **Keep it RESTful**: Mirror your API structure when possible
4. **Use descriptive names**: `"users.$userId.settings"` not `"users.$userId.s"`

### Common Patterns

```typescript
// List queries
qk("products")
qk("users")

// Detail queries
qk("products.$productId", { params: { productId } })
qk("users.$userId", { params: { userId } })

// Nested resources
qk("users.$userId.posts", { params: { userId } })
qk("posts.$postId.comments", { params: { postId } })

// Filtered lists
qk("products", { search: { category, minPrice, maxPrice } })
qk("users", { search: { role, status } })

// Paginated queries
qk("posts", { search: { page, limit } })
qk("comments", { search: { page: 1, perPage: 20 } })

// Sorted queries
qk("products", { search: { sortBy: "price", order: "asc" } })
```

### Invalidation Strategies

```typescript
const queryClient = useQueryClient();

// Invalidate a specific item
queryClient.invalidateQueries({
  queryKey: qk.use("users.$userId", { params: { userId: "123" } })
});

// Invalidate all items in a collection
queryClient.invalidateQueries({
  queryKey: qk.use("users")
});

// Invalidate all related queries (users and all nested resources)
queryClient.invalidateQueries({
  queryKey: qk.use("users") // Also invalidates "users/$userId", "users/$userId/posts", etc.
});

// Invalidate multiple patterns
queryClient.invalidateQueries({ queryKey: qk.use("users") });
queryClient.invalidateQueries({ queryKey: qk.use("posts") });
```

### Important Notes for AI Agents

1. **Always use `qk()` in `queryKey`**: This registers the pattern for type generation
2. **Use `qk.use()` for invalidation/prefetching**: Provides autocomplete for registered patterns
3. **Parent paths are automatic**: `qk("users.$userId.posts")` automatically tracks `"users"` and `"users.$userId"`
4. **Parameters are type-checked**: The plugin generates types ensuring you provide correct params
5. **Search params are for filters/options**: Use `search` for query strings, `params` for path segments
6. **Patterns are registered at build time**: The dev server must be running for type generation

### Type Safety Example

```typescript
// After using qk("users/$userId") somewhere in your code, you get:

// ✅ Correct - TypeScript happy
qk.use("users.$userId", { params: { userId: "123" } })

// ❌ Error - Missing required params
qk.use("users.$userId")

// ❌ Error - Wrong param name
qk.use("users.$userId", { params: { id: "123" } })

// ❌ Error - Pattern not registered
qk.use("nonexistent.pattern")
```

## Troubleshooting

### Types not updating on file changes

1. Check that your file matches the include patterns
2. Verify the file is not being ignored
3. Look for console logs from the plugin showing regeneration status
4. Ensure the dev server is running.

### Types not being inferred
1. Ensure the generated types file is also included in your project's typescript config.

```json
// tsconfig.json
{
  "include": ["[PATH_TO_THE_GENERATED_TYPES_FILE]"]
}
```


### Performance issues

1. Use more specific include patterns e.g. include only query files like "src/**/*.queries.ts"
2. Add appropriate ignore patterns for large directories
3. Consider excluding test files and build artifacts
