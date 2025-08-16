# Contributing to Better Query Keys

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing to our type-safe query keys library for TanStack Query.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/better-query-keys.git
   cd better-query-keys
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development process:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- For new features or fixes, create a branch from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables automatic versioning and changelog generation.

Examples of commit messages:
- `feat: add new SlotConsumer component`
- `fix: resolve issue with nested slot components`
- `docs: update API documentation`
- `test: add unit tests for SlotManager`
- `chore: update dependencies`

### Pull Requests

1. Make sure your code passes all tests and linting:
   ```bash
   pnpm lint
   pnpm test
   ```

2. Push your branch and create a pull request against `main`

3. In your PR description, clearly explain the changes and reference any related issues

## Versioning and Publishing

We use semantic versioning for this project:

1. **PATCH** version when you make backward-compatible bug fixes
2. **MINOR** version when you add functionality in a backward-compatible manner
3. **MAJOR** version when you make incompatible API changes

### Creating a Release

1. Make sure you're on the `main` branch with the latest changes
2. Update the version in package.json according to semantic versioning
3. Update the CHANGELOG.md file with a summary of changes
4. Commit and push the changes:
   ```bash
   git add .
   git commit -m "chore: release v{version}"
   git tag v{version}
   git push --follow-tags
   ```
5. Create a GitHub Release with the changelog information
6. Publish to npm:
   ```bash
   pnpm publish
   ```

## Testing

We use Vitest for testing. Run tests with:

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

The project was migrated from Jest to Vitest to leverage faster execution, better ESM support, and Vite ecosystem integration.

When adding new features, please also add corresponding tests. Our testing philosophy:

1. Write unit tests for all public APIs
2. Maintain high test coverage (aim for >80%)
3. Test edge cases and error handling
4. Keep tests fast and focused

### Testing Guidelines

- Keep tests isolated and independent
- Use descriptive test names following the pattern "should [expected behavior]"
- Use mocks judiciously to isolate components
- For testing TypeScript types, use conditional types and `expectTypeOf` when available

## Code Style and Quality

We use ESLint and TypeScript for code quality. Run linting with:

```bash
pnpm lint
```

Key principles:
- Strong TypeScript typing
- Clean, readable code
- Comprehensive documentation with JSDoc comments
- Consistent formatting with Prettier

## Documentation

Please document all public APIs using JSDoc comments, and update any relevant documentation in the README or other documentation files when making changes.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).

## Questions?

If you have any questions or need assistance, please open an issue or discussion on GitHub.
