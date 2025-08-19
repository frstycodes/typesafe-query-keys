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
- **CLI Tool**: Command-line interface for easy integration
- **Vite Plugin**: Built-in Vite plugin for seamless development
- **File Watching**: Automatic regeneration on file changes
- **Ignore Patterns**: Flexible ignore pattern support
- **Config Files**: Support for JavaScript and JSON configuration

## Installation

```bash
# Using npm
npm install @frsty/typesafe-query-keys

# Using yarn
yarn add @frsty/typesafe-query-keys

# Using pnpm
pnpm add @frsty/typesafe-query-keys
```

## Usage

### CLI Tool

The CLI tool is the most flexible way to use this package. It works with any framework and can be integrated into any build process.

```bash
# Generate types once
npx @frsty/typesafe-query-keys
# or with pnpm
pnpm dlx @frsty/typesafe-query-keys

# Watch for changes and regenerate automatically
npx @frsty/typesafe-query-keys --watch
# or with pnpm
pnpm dlx @frsty/typesafe-query-keys --watch

# With custom options
npx @frsty/typesafe-query-keys --include "src/**/*.{ts,tsx}" --exclude "**/node_modules/**" --output "src/queryKeys.gen.d.ts"
```

See [CLI Documentation](./README-CLI.md) for detailed usage instructions.

### Vite Plugin

For Vite projects, you can use the built-in plugin for seamless integration. The Vite plugin is a wrapper around the CLI utilities, ensuring consistent behavior.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { typesafeQueryKeysPlugin } from "@frsty/typesafe-query-keys";

export default defineConfig({
  plugins: [
    typesafeQueryKeysPlugin({
      outputFile: "src/queryKeys.gen.d.ts", // optional
      exclude: [".next"],
    }),
  ],
});
```

### Advanced Configuration with Ignore Patterns

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { typesafeQueryKeysPlugin } from "@frsty/typesafe-query-keys";

export default defineConfig({
  plugins: [
    typesafeQueryKeysPlugin({
      include: ["src/**/*.query.{ts,tsx}"], // Include only query files
      outputFile: "src/queryKeys.gen.ts", // optional
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/generated/**",
      ],
      ignoreFile: ".gitignore", // Use existing .gitignore file
      verbose: true // Enable verbose mode for debugging
    }),
  ],
});
```

## Plugin Options

| Option       | Type       | Default                 | Description                              |
| ------------ | ---------- | ----------------------- | ---------------------------------------- |
| `include`    | `string[]` | Required                | Glob patterns for files to scan          |
| `outputFile` | `string`   | `queryKeys.gen.d.ts`    | Output file for generated types          |
| `exclude`     | `string[]` | `[]`                    | Additional ignore patterns               |
| `ignoreFile` | `string`   | `undefined`             | Path to ignore file (e.g., `.gitignore`) |
| `verbose` | `boolean`   | `false`             | Verbose mode for debugging               |

## How It Works

The plugin:

1. **Scans your codebase** for `qk()` calls during build and development
2. **Extracts query key patterns** from the first argument of these calls
3. **Generates parent paths** automatically (e.g., `"users/$userId/posts"` also registers `"users"` and `"users/$userId"`)
4. **Watches for file changes** and regenerates types automatically
5. **Respects ignore patterns** to skip irrelevant files

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

## File Watching

The plugin automatically watches for file changes and regenerates types when:

- Files are added, modified, or deleted
- Changes match the include patterns
- Files are not ignored by the ignore patterns

## Exclude Patterns

You can specify ignore patterns in multiple ways:

1. **Direct exclude patterns** in the plugin options
2. **Ignore file** (like `.gitignore`) that the plugin will read
3. **Combination** of both

The plugin supports basic glob patterns like:

- `**/node_modules/**`
- `**/*.test.{ts,tsx}`
- `**/generated/**`
- `dist/`
- `.next`

## Troubleshooting

### Types not updating on file changes

1. Check that your file matches the include patterns
2. Verify the file is not being ignored
3. Look for console logs from the plugin showing regeneration status

### Performance issues

1. Use more specific include patterns
2. Add appropriate ignore patterns for large directories
3. Consider excluding test files and build artifacts

## CLI Tool

For framework-agnostic usage and more control, use the CLI tool:

```bash
# Generate types once
npx @frsty/typesafe-query-keys

# Or use without installing
npx @frsty/typesafe-query-keys

# Watch mode
npx @frsty/typesafe-query-keys --watch

# With custom configuration
npx @frsty/typesafe-query-keys --config ./path/to/config.js

# With CLI options
npx @frsty/typesafe-query-keys --include "src/**/*.{ts,tsx}" --output "src/custom.gen.d.ts" --verbose
```

### CLI Features

- **Framework Agnostic**: Works with any JavaScript/TypeScript project
- **Config Files**: Support for JavaScript and JSON configuration ["queryKeys.config.{ts,js}", "queryKeys.config.json", ".queryKeysrc"]
    - Also exports a `defineConfig` function from "@frsty/typesafe-query-keys/config" as a type-safe way to define configuration options
    ```ts
    import { defineConfig } from "@frsty/typesafe-query-keys/config";

    export default defineConfig({
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/node_modules/**", "**/*.test.{ts,tsx}"],
      outputFile: "src/queryKeys.gen.d.ts",
      ignoreFile: ".gitignore",
      verbose: true,
    });
    ```
- **CLI Options**: Command-line options for include, exclude, output path, and more
- **File Watching**: Cross-platform file watching with Chokidar
- **Ignore Patterns**: Flexible ignore pattern support
- **Build Integration**: Easy integration with any build process

See [CLI Documentation](./README-CLI.md) for complete usage instructions and examples.
