# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages to ensure a standardized format that makes the commit history more readable and enables automated tools to generate changelogs and version numbers.

## Format

Each commit message should have a structured format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Where:
- `<type>`: Describes the kind of change (required)
- `<scope>`: Indicates the section of the codebase affected (optional)
- `<subject>`: Brief description of the change (required)
- `<body>`: Detailed explanation of the change (optional)
- `<footer>`: Information about breaking changes or issue references (optional)

## Types

The following types are allowed:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (formatting, etc.) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

## Scope

The scope is optional and can be anything specifying the place of the commit change. For example:
- `api`
- `cli`
- `core`
- `vite-plugin`
- `codegen`
- `config`
- `utils`

## Subject

The subject should:
- Use the imperative, present tense: "change" not "changed" or "changes"
- Not capitalize the first letter
- Not end with a period
- Be concise (less than 70 characters)

## Body

The body should:
- Use the imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Be separated from the subject with a blank line

## Footer

The footer should contain information about breaking changes and references to GitHub issues that this commit closes.

Breaking changes should start with the word `BREAKING CHANGE:` with a space or two newlines.

## Examples

### Feature
```
feat(query-keys): add support for nested path extraction

Implement automatic extraction of parent paths from nested query key patterns.
This allows users to invalidate entire branches of query keys.

Closes #123
```

### Bug Fix
```
fix(codegen): resolve type generation for dynamic paths

Fix issue where dynamic path segments weren't properly typed in the generated output.
```

### Documentation
```
docs: update API documentation with new examples
```

### Breaking Change
```
feat(api): change query key format

BREAKING CHANGE: The query key format has been changed to improve type safety.
Users will need to update their existing query key definitions.

Migration guide:
- Old format: qk('users')
- New format: qk('users', {})
```

## Tooling

This project uses:
- [commitlint](https://commitlint.js.org/) to enforce this convention
- [husky](https://typicode.github.io/husky/) to set up git hooks
- [commitizen](http://commitizen.github.io/cz-cli/) to help format commit messages

You can use the following command to create properly formatted commits:

```bash
pnpm cz
```
