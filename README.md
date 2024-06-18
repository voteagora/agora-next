## Getting Started

1. Git clone this repo

2. Hit up the Discord and make sure that you get a local copy of the `.env.local` file. This is required to run the application locally. Then run the development server:
3. Run `yarn`
4. `yarn dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## About this repo

You will find a mix of different styles at work in this repo. We are a small team and will be settling on standards in the coming months as we move more and more of the multi-tennant / instance style of Agora, into one codebase.

### Data and data access paterns

The entire data model for this application is based on Postgres and Prisma. All data access should happen through the `/api` endpoints which will use Prisma to interact with the database.

We will be building a publicly accessible API soon, but for now, to keep things performant, we are using the NextJS pattern of keeping our backend, data fetching code in the `api` directory where you can see the methods that fetch the main objects in our Database:

- Proposals
- Votes
- Deletgates (users)
- Proposal transactions etc.

Most of this data comes in the form as views, or materialized views in our Postgres database that we call via Prisma and then fetch the results to the page and cascade that state down to the components.

NextJS has some peculiar data access patterns given the mix of server-side and client-side components, that we are still getting used to. When in doubt, have a look at the `<ProposalsList />` component the `src/app/page.jsx` to see the fetching model in action. The general rule in NextJS is that you primary "server" component should do the fetching to keep it fast and use the cache in the best way possible, and then your client components can recieve that data from server components to add any interactivity you want.

#### Data fetching

When rendering the various components on the page on the server, it's commong that many different components need to access the same data for a single request. For example, a user's address or ENS name may need to be displayed both on a component on the page and in the page metdata. 

To avoid re-fetching the same data for a given request, Next.JS includes the `fetch('example.api/resource')` API, which retrieves and caches external resources ([see](https://nextjs.org/docs/app/building-your-application/data-fetching)). 

When we're unable to use the `fetch()` (e.g. because we're accessing data via the Primsa ORM client, via the DynamoDB client, etc.) the pattern we have adopted to make sure that these resources are not being fetched and re-fetched needlessly in the single request is to use the react cache to manually wrap these accesses. 

As mentioned above, all data access code under `/api` should 
1) be wrapped in a `React.cache` invocation
2) by default, _only_ export cache-wrapped data accesses, to prevent unintentional mutliple fetching

See `/src/app/api/common/delegates/getDelegates.ts` for an example.

#### DB Access

You will want to have a Database / SQL Viewer so that you can explore the data. Most of us use:

- [TablePlus](https://tableplus.com/)

Ping the Discord to get access to the database.

You can also explore the queries here: `https://github.com/voteagora/queries`

#### Database strcuture

This applicaiton uses a Postgres database with the following schemas:

- **center**: Admin-only access
- **config**: Shared configuration data
- **agora**: Shared data, such as customer information and aggregations
- **[dao namespace]**: Dao dedicated namespaces like optimism, ens, etc.

While prisma is used to manage the access to the database and typescript abstractions, the actual schema is managed in a separate [repository](https://github.com/voteagora/queries) using custom migration scripts.

To make sure that you are using the latest schema, you should run the following command:

```bash
npx prisma db pull
npx prisma generate
```

More information about how to work with the database can be found in the [Database Maunal](https://www.notion.so/argoagora/Database-Manual-7f59ed03bffb4096a2b19e34e2956085)

### Typescript vs. Javascript

You will see a mix of JS and TS. Don't be alarmed. TS was meant to bolster the productivity of Javascript engineers but sometimes, it can get in the way when you are doing something simple. As a general rule, we will want backend API code written in TypeScript and will eventually move the whole app over, but if some views start as JSX files, don't complain or hammer Discord. Learn to love the chaos.

### Styles and CSS

The application is using a combination of Tailwind, Emotion and native SCSS. Our old codebase relied exclusively on `emotion/css` in-line styles and you might see some relics of that form here but it's best to use the pattern shown in the Hero component as an example of how to write new code.

There are three theme files in this repo, but the goal will be to move 1 or 2 in the near future.

1. `@/styles/theme.js` -> This is the Javascript representation of the theme file and should be used only if you are porting old `emotion/css` components from the old repo.
2. `@/styles/variables.scss` -> This the same theme file expressed as SCSS variables so that we can import the theme into component level SCSS files more easily.
3. `tailwind.config.js` -> This is the Tailwind configuration file. We are using Tailwind for utility classes but still want the flexibility of native CSS so this allows us to import our theme into Tailwind.

If you add a new style to any of these files, you should duplicate them across all files.

### Building new components

Use `@/components/Hero` as the reference for this section to see how clean the template file is + the corresponding styles.

1. Think of a good name for your component
2. Navigate to the component tree and see if there is already a folder that semantically matches what your new comonent will do. If not, create one.
3. Duplicate the name of the folder as a JS/TSX file inside it. This will be your component.
4. Create a `<folder_name>.module.scss` file and name it with the same name as your component file. This will hold the styles.
5. Build your component
6. Use semantic HTML elements where appropirate and target styles using the class name
7. In your SCSS file, make sure that you import

### Global styles

There will be some styles that should be set as Global styles, if that is the case they should be prefixed with `gl_` and imported into `@/styles/globals.scss`.

### Using TailWind

The `HStack` and `VStack` components have been modified to support Tailwind directives. Everything is pretty similar except for two key details:

1. Gaps are now passed as ints instead of strings: ie, `gap={4}` instead of `gap="4"`
2. The justify and align directives use tailwind vs. standard CSS directives. Have a look at the `Stack.tsx` component to see how this is done and to see all available directives.

The main usage of direct Tailwind classes can be found in a single component

`@/components/Layout/PageContainer.tsx`

```jsx
import React, { ReactNode } from "react";

import { VStack } from "@/components/Layout/Stack";
import { Analytics } from "@vercel/analytics/react";

type Props = {
  children: ReactNode,
};

export function PageContainer({ children }: Props) {
  return (
    <div className="container my-4 mx-auto sm:px-8">
      <div className="gl_bg-dotted-pattern" />
      <div className="gl_bg-radial-gradient" />
      {children}
      <Analytics />
    </div>
  );
}
```

The rest of the time, you should be able to use standard SCSS directives along with the variables in the `@/styles/variables.scss` file.

## Understand the layout of the application

In NextJS there are a few key files and folders to understand:

`@/app`
This directory holds the primary application and each folder represents a different section of the app. So for example the `@/app/delegates` maps to: `https://app.example.com/delegates`

There is no Router.

The router is the directory structure of the `/app` directory.

Each folder contains a magical page called `page.jsx` or `page.jsx` this acts as the `index` page for the route. So for example `@/app/delegates/page.jsx` is the index page for `https://app.example.com/delegates`

`@app/lib`
Helpers and utilities, reserverd word.

`@app/layout.tsx`

This is the primary wrapper of the application, similar to the `index.html` page in a standard React app.

`@/app/page.jsx`

This is the index page of application

`@/app/api`

This is where all of the server functions will live. Anything that deals with the REST API, fetching data from the database etc, will live here.

`@/components`

This is where all of the React components will live that will be pulled into the pages and views.

`@/styles`

This is where all of the global styles and themes will live

`@/assets`

This is where all of the images, fonts, and other assets will live.

## Instrumentation + Observability

We have integrated [OpenTelemetry](https://opentelemetry.io/) (OTel) to aid in instrumenting the application. OTel is a vendor-agnostic observability providing a single set of APIs, libraries, agents, and instrumentation to capture distributed traces and metrics.



## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
