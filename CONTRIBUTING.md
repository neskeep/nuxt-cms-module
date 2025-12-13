# Contributing to Nuxt CMS

First off, thank you for considering contributing to Nuxt CMS! It's people like you that make this project better for everyone.

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something great together.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected
- Include screenshots if relevant
- Include your environment details (Nuxt version, database type, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this feature would be useful
- Include examples of how it would be used

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `pnpm install`
3. **Make your changes**
4. **Test your changes**: `pnpm run dev` and test in the playground
5. **Build the module**: `pnpm run build`
6. **Commit your changes** using clear, descriptive commit messages
7. **Push to your fork** and submit a pull request

#### Commit Message Guidelines

We follow conventional commits:

- `feat: add new field type`
- `fix: resolve avatar upload issue`
- `docs: update README with new examples`
- `chore: update dependencies`
- `refactor: simplify authentication logic`
- `test: add tests for media upload`
- `perf: optimize database queries`

#### Pull Request Guidelines

- Keep changes focused - one feature/fix per PR
- Update documentation for any new features
- Add tests if applicable
- Ensure CI passes
- Follow the existing code style
- Don't include unrelated changes

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/nuxt-cms-module.git
cd nuxt-cms-module

# Install dependencies
pnpm install

# Prepare the module (build stubs and prepare playground)
pnpm run dev:prepare

# Start development server with playground
pnpm dev

# Build the module
pnpm run build

# Run tests
pnpm test
```

### Project Structure

```
src/runtime/
├── components/     # Vue components for admin panel
├── composables/    # Vue composables for data fetching
├── pages/          # Admin panel pages
├── server/         # Server-side code (API, database, middleware)
├── types/          # TypeScript type definitions
└── locales/        # i18n translations

playground/         # Development playground for testing
scripts/            # Utility scripts
docs/              # Documentation
```

### Testing Your Changes

1. **Manual Testing**
   - Use the playground: `pnpm dev`
   - Test with both SQLite and PostgreSQL
   - Test in Nuxt 3 and Nuxt 4 projects
   - Test all affected features thoroughly

2. **Browser Testing**
   - Test in Chrome, Firefox, and Safari
   - Test on mobile viewports
   - Check console for errors

3. **Build Testing**
   - Run `pnpm run build` to ensure no build errors
   - Test the built module in an external project

## Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API with `<script setup>`
- Use meaningful variable and function names
- Comment complex logic
- Keep functions small and focused
- Avoid over-engineering - simple is better

## Adding New Features

### New Field Type

1. Create component in `src/runtime/components/fields/YourField.vue`
2. Follow the standard field component structure
3. Use the design system CSS variables
4. Register in `src/runtime/components/fields/index.ts`
5. Add TypeScript types in `src/runtime/types/fields.d.ts`
6. Update documentation

### New API Endpoint

1. Create file in `src/runtime/server/api/cms/`
2. Use `requireAuth()` and `requirePermission()` as needed
3. Validate input with proper error messages
4. Follow RESTful conventions
5. Document the endpoint

## Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md following Keep a Changelog format
- Add inline code comments for complex logic
- Update TypeScript types and JSDoc comments

## Questions?

- Open a discussion on GitHub Discussions
- Check existing issues and pull requests
- Read the documentation thoroughly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Nuxt CMS! 🚀
