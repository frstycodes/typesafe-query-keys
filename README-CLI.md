# Typesafe Query Keys CLI

A command-line tool that generates TypeScript types for your query keys by scanning your codebase for `qk.new()` calls. This tool is framework-agnostic and can be used with any JavaScript/TypeScript project.

## Installation

### Global Installation

```bash
npm install -g @frsty/typesafe-query-keys
```

### Local Installation

```bash
npm install @frsty/typesafe-query-keys
```

## Quick Start

1. **Create a configuration file** (see Configuration section below)
2. **Run the CLI**:

   ```bash
   # Generate types once
   typesafe-query-keys

   # Watch for changes and regenerate automatically
   typesafe-query-keys --watch
   ```

## Configuration

The CLI tool reads configuration from a config file. You can specify the config file path using the `--config` option.

### Supported Config Formats

- **JavaScript**: `query-keys.config.js`
- **JSON**: `query-keys.config.json`

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

| Option       | Type       | Required | Description                              |
| ------------ | ---------- | -------- | ---------------------------------------- |
| `include`    | `string[]` | ✅       | Glob patterns for files to scan          |
| `outputFile` | `string`   | ✅       | Path to the output file                  |
| `ignore`     | `string[]` | ❌       | Additional ignore patterns               |
| `ignoreFile` | `string`   | ❌       | Path to ignore file (e.g., `.gitignore`) |

## CLI Options

```bash
typesafe-query-keys [options]
```

| Option                | Description                  | Default                |
| --------------------- | ---------------------------- | ---------------------- |
| `-c, --config <path>` | Path to config file          | `query-keys.config.js` |
| `-w, --watch`         | Watch for file changes       | `false`                |
| `--once`              | Generate types once and exit | `false`                |
| `-h, --help`          | Show help                    | -                      |
| `-V, --version`       | Show version                 | -                      |

## Usage Examples

### Basic Usage

```bash
# Generate types once using default config
typesafe-query-keys

# Generate types once using custom config
typesafe-query-keys --config my-config.js

# Watch for changes and regenerate automatically
typesafe-query-keys --watch

# Generate types once and exit (explicit)
typesafe-query-keys --once
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
// query-keys.config.js
module.exports = {
  include: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ],
  outputFile: "lib/query-keys.gen.ts",
  ignore: [
    "**/node_modules/**",
    ".next/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
};
```

#### React (Create React App)

```javascript
// query-keys.config.js
module.exports = {
  include: ["src/**/*.{ts,tsx}"],
  outputFile: "src/query-keys.gen.ts",
  ignore: [
    "**/node_modules/**",
    "build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
};
```

#### Vite

```javascript
// query-keys.config.js
module.exports = {
  include: ["src/**/*.{ts,tsx}"],
  outputFile: "src/query-keys.gen.ts",
  ignore: [
    "**/node_modules/**",
    "dist/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  ignoreFile: ".gitignore",
};
```

## How It Works

1. **Scans your codebase** for `qk.new()` calls using the specified include patterns
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
✅ Types generated successfully

👀 Starting file watcher...
🔍 Initial scan for query key patterns...
✅ Initial types generated successfully
🚀 Watching for file changes...
Press Ctrl+C to stop

📝 File changed: src/components/UserProfile.tsx
🔄 Regenerating types for src/components/UserProfile.tsx
✅ Types regenerated successfully
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

## Integration with Build Tools

### Webpack

```javascript
// webpack.config.js
const { typesafeQueryKeysPlugin } = require("@frsty/typesafe-query-keys");

module.exports = {
  // ... other config
  plugins: [
    typesafeQueryKeysPlugin({
      include: ["src/**/*.{ts,tsx}"],
      outputFile: "src/query-keys.gen.ts",
    }),
  ],
};
```

### Rollup

```javascript
// rollup.config.js
import { typesafeQueryKeysPlugin } from "@frsty/typesafe-query-keys";

export default {
  // ... other config
  plugins: [
    typesafeQueryKeysPlugin({
      include: ["src/**/*.{ts,tsx}"],
      outputFile: "src/query-keys.gen.ts",
    }),
  ],
};
```

## Contributing

The CLI tool is built with:

- **Commander.js** for CLI argument parsing
- **Chokidar** for cross-platform file watching
- **TypeScript** for type safety
- **Glob** for file pattern matching

## License

MIT
