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

## Product overview

This project is an Agora application built using Next.js, TypeScript, and React. It is a decentralized platform for creating and managing proposals, with features such as voting, proposal creation, and proposal execution.

## Proposal specs and gotchas

- import @specs/proposals.md

## Delegation specs and gotchas

- import @specs/delegations.md

## Voting specs and gotchas

- import @specs/voting.md
