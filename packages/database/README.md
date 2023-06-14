### Database

We use [Prisma](https://prisma.io/) to manage & access our database. As such you will need a database for this project, either locally or hosted in the cloud.

Set `POSTGRES_URL` in the root `.env` file to point to the local or remote database.

Once deployed & up & running, you will need to create & deploy migrations to your database to add the necessary tables. This can be done using [Prisma Migrate](https://www.prisma.io/migrate):

```bash
pnpm db:migrate:dev
```

If you need to push any existing migrations to the database, you can use either the Prisma db push or the Prisma migrate deploy command(s):

```bash
pnpm db:migrate:deploy
```

There is slight difference between the two commands & [Prisma offers a breakdown on which command is best to use](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push#choosing-db-push-or-prisma-migrate).

An optional additional step is to seed some initial or fake data to your database using [Prisma's seeding functionality](https://www.prisma.io/docs/guides/database/seed-database).

To do this update check the seed script located in `packages/database/src/seed.ts` & add or update any users you wish to seed to the database.

Once edited run the following command to run tell Prisma to run the seed script defined in the Prisma configuration:

```bash
pnpm db:seed
```

For further more information on migrations, seeding & more, we recommend reading through the [Prisma Documentation](https://www.prisma.io/docs/).
