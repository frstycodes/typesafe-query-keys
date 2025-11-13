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

- **Framework Agnostic**: Works with any JavaScript/TypeScript project
- **Plugins**: Vite and Webpack are currently supported
- **CLI & Generic Plugin**: CLI tool or a generic plugin for frameworks without a dedicated plugin
- **Realtime updates**: Automatic regeneration on file changes

## Installation

```bash
npm install @frsty/typesafe-query-keys
```

## Usage

### CLI Tool
Use the CLI if there isn't a dedicated plugin for your framework. The CLI automatically picks config from your project root with names: `queryKeys.config.{ts,js}` or any rc style file with the name `queryKeys`

```ts
// queryKeys.config.ts
import { defineConfig } from "@frsty/typesafe-query-keys";

export default defineConfig({
  include: ['src/**/*.queries.ts'],
  exclude: ["**/temp", "**/.tanstack"],
  functionNames: ['createQK', 'queryKey'],
  ouputPath: ".generated/query-keys.d.ts",
  verbose: true,
})
````

```bash
# Generate types once
npx @frsty/typesafe-query-keys

# Watch for changes and regenerate automatically
npx @frsty/typesafe-query-keys --watch

# Or if you have it installed you can use
typesafe-query-keys
typesafe-query-keys --watch

# With config path
npx @frsty/typesafe-query-keys --config my-custom-config.config.ts"
```

### Vite Plugin
For Vite projects, you can use the the plugin.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import typesafeQueryKeys from "@frsty/typesafe-query-keys/plugin/vite";

export default defineConfig({
  plugins: [
    typesafeQueryKeys({
      include: ['src/**/*.queries.ts'],
      exclude: ["**/temp", "**/.tanstack"],
      functionNames: ['createQK', 'queryKey'],
      ouputPath: ".generated/query-keys.d.ts",
      verbose: true,
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
        include: ['src/**/*.queries.ts'],
        exclude: ["**/temp", "**/.tanstack"],
        functionNames: ['createQK', 'queryKey'],
        ouputPath: ".generated/query-keys.d.ts",
        verbose: true,
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
  include: ['src/**/*.queries.ts'],
  exclude: ["**/temp", "**/.tanstack"],
  functionNames: ['createQK', 'queryKey'],
  ouputPath: ".generated/query-keys.d.ts",
  verbose: true,
})

export default {
  // Next config goes here
} satisfies NextConfig
```

## Plugin Options

| Option       | Type       | Default                 | Description                              |
| ------------ | ---------- | ----------------------- | ---------------------------------------- |
| `include`    | `string[]` | `[src/**/*.{ts,tsx,js,jsx}]                | Glob patterns for files to scan          |
| `outputPath` | `string`   | `.generated/query-keys.gen.d.ts`    | Output file for generated types          |
| `exclude`     | `string[]` | `["node_modules" "vite.config.*"]`                    | Additional ignore patterns               |
| `functionNames` | `string[]`   | `["qk"]`             | Function names to extract query keys from (`qk` is always included) |
| `verbose` | `boolean`   | `false`             | Verbose mode for debugging               |

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
  queryKey: qk("users/$userId/posts", {
    params: { userId: "123" }
  }),
  queryFn: async () => {
    const response = await fetch(`https://api.example.com/users/${userId}/posts`);
    return response.json();
  }
})

// Use the registered pattern with `qk.use()` (with autocomplete)
const userPostsQK = qk.use("users/$userId/posts", {
  params: { userId: "123" },
});

// Invalidate all user queries
queryClient.invalidateQueries({queryKey: qk.use("users")})
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
