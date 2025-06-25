# Claude Configuration

## Code Formatting
This project uses Prettier for code formatting. Please format all code changes using the project's Prettier configuration.

Available formatting commands:
- `yarn prettier-src` - Format all files in src/
- `yarn check-prettier` - Check if files are properly formatted

## Project Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn typecheck` - Run TypeScript type checking
- `yarn test` - Run tests

## Before committing
Always run these commands before committing:
1. `yarn prettier-src` - Format code
2. `yarn lint` - Check for linting errors
3. `yarn typecheck` - Check for TypeScript errors