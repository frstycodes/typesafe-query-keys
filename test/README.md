# Testing Guide for Better Query Keys

This folder contains all tests for the `@frsty/typesafe-query-keys` library, organized into unit and integration tests to ensure complete coverage and reliability.

## Test Structure

- **Unit Tests**: Test individual components in isolation
  - `query-keys.test.ts` - Core functionality tests
  - `utils/` - Tests for utility functions
  - `codegen/` - Tests for code generation functionality
  - `config/` - Tests for configuration parsing and validation

- **Integration Tests**: Test multiple components working together
  - `integration.test.ts` - End-to-end workflow tests

## Running Tests

You can run the tests in several ways:

### Using npm/yarn/pnpm

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

### Using the test runner script

```bash
node run-tests.js
```

## Coverage Goals

We aim for high test coverage across all components:

- 90%+ line coverage
- 80%+ branch coverage
- 90%+ function coverage

## Writing New Tests

When adding new features or fixing bugs, please add appropriate tests that:

1. Test both the happy path and error conditions
2. Mock external dependencies appropriately
3. Keep tests focused and maintainable
4. Include type checking where relevant (especially for TypeScript types)

### Testing TypeScript Types

For testing TypeScript types, we use a combination of:

1. Type assertions in the tests (`expectType<T>`, etc.)
2. Type declaration augmentation to simulate generated types
3. Explicit `@ts-expect-error` comments to verify type errors

### Mocking Strategy

- Use Vitest's mocking capabilities for external dependencies
- Explicitly type mock return values where possible
- Reset mocks after each test to prevent cross-test contamination

## Continuous Integration

Tests are automatically run in CI for:
- Pull requests
- Merges to main branch
- Version releases

## Troubleshooting

If tests are failing, check:

1. TypeScript version compatibility
2. Node.js version
3. Missing dependencies
4. Mock configuration issues

## Code Coverage Report

After running tests with coverage, view the HTML report at:
`./coverage/index.html`
