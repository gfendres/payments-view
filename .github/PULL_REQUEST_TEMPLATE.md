## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code style update (formatting, renaming)
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Build/config update

## Related Issue

<!-- Link to the issue this PR addresses -->

Closes #(issue number)

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## How to Test

<!-- Provide step-by-step instructions to test the changes -->

1.
2.
3.

**Expected behavior:**

## Screenshots/Videos

<!-- If applicable, add screenshots or videos to demonstrate the changes -->

## Checklist

<!-- Mark completed items with an 'x' -->

### Code Quality

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have searched the codebase for existing similar implementations

### Architecture

- [ ] My changes follow the Domain Driven Design architecture
- [ ] Code is in the correct layer (Domain/Application/Infrastructure/API/UI)
- [ ] No business logic in UI components (extracted to hooks)
- [ ] Using enums from `@payments-view/constants` (no magic strings/numbers)
- [ ] Using `Result` type for error handling (no throwing errors in domain/application)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested on multiple browsers (if UI change)
- [ ] I have tested on mobile (if UI change)

### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have updated the README if needed
- [ ] I have added/updated JSDoc comments for new functions/classes

### Quality Checks

- [ ] `bun run typecheck` passes with no errors
- [ ] `bun run lint` passes with no errors
- [ ] `bun test` passes with no failures
- [ ] No `any` types used
- [ ] Files are under 500 lines
- [ ] Functions are under 30 lines

### Git

- [ ] My commits follow the [Conventional Commits](https://www.conventionalcommits.org/) format
- [ ] I have rebased on the latest main branch
- [ ] I have resolved all merge conflicts

## Additional Notes

<!-- Add any additional context, concerns, or questions here -->

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

---

**By submitting this PR, I confirm that:**

- I have read and followed the [Contributing Guidelines](../CONTRIBUTING.md)
- I have read and agree to the [Code of Conduct](../CODE_OF_CONDUCT.md)
- My contribution is made under the project's license (MIT)

