# Agora

The Agora [Turborepo](https://turbo.build) includes the following packages/apps:

### Apps and Packages

- `nouns`: The Nouns Agora [Next.js](https://nextjs.org/) app
- `database`: [Prisma](https://prisma.io/) ORM wrapper to manage & access your database
- `ui`: a stub React component library shared by applications (later to be refactored into an independent published package)
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Local development

Duplicate `.example.env` and rename to `.env`, specifying all required environment variables.

To develop all apps and packages:

```bash
pnpm dev
```

#### Database

1. Create a local db and set `POSTGRES_URL` in `.env`
2. Generate prisma types

```bash
pnpm generate
```

3. Run migrations

```bash
pnpm db:migrate:dev
```

> More details and commands can be found on the [database README](./packages/database/README.md)

### Build

To build all apps and packages:

```bash
pnpm build
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```bash
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
pnpm dlx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
