# Typesafe Query Keys CLI

A command-line tool that generates TypeScript types for your query keys by scanning your codebase for `qk()` calls. This tool is framework-agnostic and can be used with any JavaScript/TypeScript project.

## Installation

### Installation

```bash
# Using npm
npm install @frsty/typesafe-query-keys

# Using yarn
yarn add @frsty/typesafe-query-keys

# Using pnpm
pnpm add @frsty/typesafe-query-keys
```

## Quick Start

1. **Create a configuration file** (see Configuration section below)
2. **Run the CLI**:

   ```bash
   # Generate types once
   npx @frsty/typesafe-query-keys

   # Watch for changes and regenerate automatically
   npx @frsty/typesafe-query-keys --watch
   ```

## Configuration

The CLI tool reads configuration from a config file. You can specify the config file path using the `--config` option.

### Supported Config Formats

- **TypeScript**: `queryKeys.config.ts`
- **JavaScript**: `queryKeys.config.js`
- **JSON**: `queryKeys.config.json`
- **RC file**: `.queryKeysrc`

### Example Configuration

#### JavaScript Config (`query-keys.config.js`)

```javascript
/** @type {import('@frsty/typesafe-query-keys').Config} */
module.exports = {
  include: [
    "src/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "pages/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  outputFile: "src/query-keys.gen.ts",
  ignore: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "**/generated/**",
    "**/*.gen.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
};
```

#### JSON Config (`query-keys.config.json`)

```json
{
  "include": [
    "src/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "pages/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}"
  ],
  "outputFile": "src/query-keys.gen.ts",
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "**/generated/**",
    "**/*.gen.{ts,tsx}"
  ],
  "ignoreFile": ".gitignore"
}
```

## Configuration Options

| Option       | Type       | Required | Default | Description                              |
| ------------ | ---------- | -------- | ------- | ---------------------------------------- |
| `include`    | `string[]` | ✅       | `**/*.{ts,tsx,js,jsx}` | Glob patterns for files to scan |
| `outputFile` | `string`   | ❌       | `queryKeys.gen.d.ts` | Path to the output file         |
| `exclude`    | `string[]` | ❌       | `[]`    | Additional exclude patterns              |
| `ignoreFile` | `string`   | ❌       | `null`  | Path to ignore file (e.g., `.gitignore`) |
| `verbose`    | `boolean`  | ❌       | `false` | Enable verbose logging                   |

## CLI Options

```bash
typesafe-query-keys [options]
```

| Option                          | Description                        | Default                    |
| ------------------------------- | ---------------------------------- | -------------------------- |
| `-i, --include <glob pattern>`  | Paths to include                   | `**/*.{ts,tsx,js,jsx}`     |
| `-e, --exclude <glob pattern>`  | Paths to exclude                   | -                          |
| `-o, --output <path>`           | Path to the generated output file  | `queryKeys.gen.d.ts`       |
| `-f, --ignoreFile <path>`       | Path to an ignore file             | -                          |
| `-v, --verbose`                 | Enable verbose logging             | `false`                    |
| `-c, --config <path>`           | Path to config file                | Searches common file paths |
| `-w, --watch`                   | Watch for file changes             | `false`                    |
| `--once`                        | Generate types once and exit       | `false`                    |
| `-h, --help`                    | Show help                          | -                          |
| `-V, --version`                 | Show version                       | -                          |

## Usage Examples

### Basic Usage

```bash
# Generate types once using default config
npx @frsty/typesafe-query-keys

# Generate types once using custom config
npx @frsty/typesafe-query-keys --config my-config.js

# Watch for changes and regenerate automatically
npx @frsty/typesafe-query-keys --watch

# Generate types once and exit (explicit)
npx @frsty/typesafe-query-keys --once

# Specify include/exclude patterns and output file
npx @frsty/typesafe-query-keys --include "src/**/*.{ts,tsx}" --exclude "**/node_modules/**" --output "src/custom.gen.d.ts"

# Enable verbose logging
npx @frsty/typesafe-query-keys --verbose
```

### Integration with Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "generate:types": "typesafe-query-keys",
    "generate:types:watch": "typesafe-query-keys --watch",
    "dev": "npm run generate:types:watch & your-dev-command"
  }
}
```

### Framework-Specific Examples

#### Next.js

```javascript
// queryKeys.config.js
import { defineConfig } from "@frsty/typesafe-query-keys/config";

export default defineConfig({
  include: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ],
  outputFile: "lib/queryKeys.gen.d.ts",
  exclude: [
    "**/node_modules/**",
    ".next",
    ".test",
    "*.spec.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
  verbose: true,
});
```

#### React (Create React App)

```javascript
// queryKeys.config.js
import { defineConfig } from "@frsty/typesafe-query-keys/config";

export default defineConfig({
  include: ["src/**/*.{ts,tsx}"],
  outputFile: "src/queryKeys.gen.d.ts",
  exclude: [
    "**/node_modules/**",
    "build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
  verbose: false,
});
```


## How It Works

1. **Scans your codebase** for `qk()` calls using the specified include patterns
2. **Extracts query key patterns** from the first argument of these calls
3. **Generates parent paths** automatically (e.g., `"users/$userId/posts"` also registers `"users"` and `"users/$userId"`)
4. **Watches for file changes** (in watch mode) and regenerates types automatically
5. **Respects ignore patterns** to skip irrelevant files

## File Watching

When using the `--watch` flag, the CLI tool:

- **Monitors file changes** using Chokidar for cross-platform compatibility
- **Debounces regeneration** to avoid excessive processing
- **Handles multiple rapid changes** gracefully
- **Provides real-time feedback** with emoji indicators
- **Gracefully shuts down** on Ctrl+C

## Example Output

```
🔍 Scanning for query key patterns...
Generated query key definitions in 1ms

🔍 Initial scan for query key patterns...
Generated query key definitions in 1ms
🚀 Watching for file changes...
Press Ctrl+C to stop

🔄 Regenerating types for src/components/UserProfile.tsx
Generated query key definitions in 2ms
```

## Troubleshooting

### Types not generating

1. **Check your config file** exists and is valid
2. **Verify include patterns** match your file structure
3. **Check ignore patterns** aren't excluding your files
4. **Look for console errors** in the CLI output

### Performance issues

1. **Use more specific include patterns** to reduce scan time
2. **Add appropriate ignore patterns** for large directories
3. **Exclude test files and build artifacts**
4. **Consider using `--once`** instead of `--watch` for CI/CD

### File watching not working

1. **Check file permissions** on your project directory
2. **Verify your OS supports** file watching (most do)
3. **Try running with elevated permissions** if needed
4. **Check for antivirus software** blocking file watching

## Contributing

The CLI tool is built with:

- **Commander.js** for CLI argument parsing
- **Chokidar** for cross-platform file watching
- **TypeScript** for type safety
- **Glob** for file pattern matching

## License

MIT
