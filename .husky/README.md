# Git Hooks with Husky

This directory contains Git hooks configured with [Husky](https://typicode.github.io/husky/) to maintain code quality and consistent commit messages.

## Hooks

### commit-msg

The `commit-msg` hook enforces the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages. This ensures that our commit history is readable and can be used to generate changelogs automatically.

Format:
```
<type>(<scope>): <subject>
```

Example commit messages:
- `feat(api): add support for nested query keys`
- `fix(codegen): resolve type generation for dynamic paths`
- `docs: update README with new examples`

### pre-commit

This hook is configured but doesn't run any checks, as we prefer to handle code quality through our CI pipeline.

## Using Commitizen

To make it easier to write standard-compliant commit messages, you can use [Commitizen](http://commitizen.github.io/cz-cli/) with:

```bash
pnpm commit
```

This interactive tool will prompt you for all required information and format your commit message correctly.

## Documentation

For more details on our commit convention, please see [COMMIT_CONVENTION.md](../.github/COMMIT_CONVENTION.md).