# Claude Configuration

## Code Formatting

This project uses Prettier for code formatting. Please format all code changes using the project's Prettier configuration.

## Code Style

This project uses TypeScript for code style. Please use TypeScript for all code changes.
Keep the order of imports consistent, with the following order:

1. React and Next.js imports
2. External imports
3. Absolute imports
4. Local imports or relative imports

## Available formatting commands:

- `npm run prettier-src` - Format all files in src/
- `npm run check-prettier` - Check if files are properly formatted

## Project Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

## Before committing

Always run these commands before committing:

1. `npm run prettier-src` - Format code
2. `npm run lint` - Check for linting errors
3. `npm run typecheck` - Check for TypeScript errors
