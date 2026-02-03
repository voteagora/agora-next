## Getting Started

1. Git clone this repo.

2. Hit up the Discord and make sure that you get a local copy of the `.env.local` file. This is required to run the application locally. Then run the development server:
3. Run `npm install`
4. `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

This project uses various environment variables for configuration. Below is a comprehensive guide with detailed usage information for each variable.

### 🔴 Critical Configuration (Required)

#### **NEXT_PUBLIC_AGORA_INSTANCE_NAME**

- **Purpose**: Identifies which DAO configuration to load (e.g., "ens", "uniswap", "optimism", "derive", "cyber", "xai", "boost", "scroll", "linea", "etherfi", "b3", "protocol-guild")
- **Required**: YES - Application won't start without this
- **Usage**: Controls the entire tenant configuration including contracts, UI theme, and features
- **Example**: `NEXT_PUBLIC_AGORA_INSTANCE_NAME=ens`
- **Related**: Works with `NEXT_PUBLIC_AGORA_ENV` to determine environment-specific settings

#### **NEXT_PUBLIC_AGORA_INSTANCE_TOKEN**

- **Purpose**: Token symbol for the DAO instance (e.g., "ENS", "OP", "UNI")
- **Required**: YES - Used in UI displays and token references
- **Usage**: Displayed throughout the UI when referring to the governance token
- **Example**: `NEXT_PUBLIC_AGORA_INSTANCE_TOKEN=ENS`
- **Note**: Should match the actual token symbol of the DAO

#### **NEXT_PUBLIC_AGORA_ENV**

- **Purpose**: Determines production vs development environment
- **Required**: YES
- **Values**: `"prod"` for production, `"dev"` or any other value for development
- **Impact**: Controls:
  - Which database URLs are used (READ_WRITE_WEB2_DATABASE_URL_PROD vs \_DEV)
  - Contract addresses (mainnet vs testnet)
  - Feature toggles and safety checks
  - API endpoints (prod vs dev environments)
  - EAS schema selection (different schemas for prod/dev)
  - Snapshot space selection
- **Example**: `NEXT_PUBLIC_AGORA_ENV=prod`
- **Note**: Also available as `AGORA_ENV` in some legacy components

#### **NEXT_PUBLIC_ALCHEMY_ID**

- **Purpose**: Alchemy API key for client-side blockchain RPC access (browser)
- **Required**: YES (unless using `NEXT_PUBLIC_FORK_NODE_URL`)
- **Usage**: Used for client-side chain interactions (wagmi, Web3Provider, hooks)
- **Security**: Public but sensitive - **MUST be domain-whitelisted** in Alchemy dashboard
- **Fallback**: Can be overridden by `NEXT_PUBLIC_FORK_NODE_URL` for local development
- **Example**: `NEXT_PUBLIC_ALCHEMY_ID=your_client_alchemy_api_key`

#### **SERVERSIDE_ALCHEMY_ID_DEV**

- **Purpose**: Alchemy API key for server-side blockchain RPC access in development (Node.js)
- **Required**: RECOMMENDED for development (falls back to `NEXT_PUBLIC_ALCHEMY_ID` if not set)
- **Usage**: Automatically used when `NEXT_PUBLIC_AGORA_ENV=dev` via `getAlchemyId()` helper
- **Security**: Private - never exposed to browser, no domain restrictions needed
- **Example**: `SERVERSIDE_ALCHEMY_ID_DEV=your_dev_server_alchemy_api_key`

#### **SERVERSIDE_ALCHEMY_ID_PROD**

- **Purpose**: Alchemy API key for server-side blockchain RPC access in production (Node.js)
- **Required**: RECOMMENDED for production (falls back to `NEXT_PUBLIC_ALCHEMY_ID` if not set)
- **Usage**: Automatically used when `NEXT_PUBLIC_AGORA_ENV=prod` via `getAlchemyId()` helper
- **Security**: Private - never exposed to browser, no domain restrictions needed
- **Why separate?**: Prevents leaked client keys from being used for server-side operations
- **Auto-detection**: Code automatically uses the right key based on execution context and environment
- **Example**: `SERVERSIDE_ALCHEMY_ID_PROD=your_prod_server_alchemy_api_key`

### 📊 Database Configuration

#### **DATABASE_URL**

- **Purpose**: PostgreSQL database connection string
- **Required**: Conditional - see usage notes
- **Special Values**:
  - `"dev"` - Uses development database URLs
  - `"prod"` - Uses production database URLs
  - Direct URL - Overrides environment-specific URLs
- **Format**: `postgres://user:password@host/database`
- **Note**: If not set, falls back to environment-specific URLs below

#### **READ*WRITE_WEB2_DATABASE_URL*[PROD|DEV]**

- **Purpose**: Database for user-generated content (profiles, settings)
- **Required**: YES (based on `NEXT_PUBLIC_AGORA_ENV`)
- **Usage**: Read-write operations for web2 data
- **Example**: `READ_WRITE_WEB2_DATABASE_URL_PROD=postgres://...`

#### **READ*ONLY_WEB3_DATABASE_URL*[PROD|DEV]**

- **Purpose**: Database for blockchain indexed data
- **Required**: YES (based on `NEXT_PUBLIC_AGORA_ENV`)
- **Usage**: Read-only operations for web3 data (proposals, votes, delegates)
- **Example**: `READ_ONLY_WEB3_DATABASE_URL_PROD=postgres://...`

### 🔐 Authentication & Security

#### **GAS_SPONSOR_PK**

- **Purpose**: Private key for sponsoring gas fees in relay transactions
- **Required**: YES for gasless transactions feature
- **Security**: CRITICAL - Never expose in client code or logs
- **Usage**: Enables users to delegate/vote without paying gas
- **Format**: Hex string without 0x prefix
- **Location**: Server-side only (`/api/v1/relay/*`)

#### **EAS_SENDER_PRIVATE_KEY**

- **Purpose**: Private key for Ethereum Attestation Service operations
- **Required**: YES for attestation features
- **Security**: CRITICAL - Server-side only
- **Usage**: Creates on-chain attestations for verified delegates
- **Format**: Hex string

#### **JWT_SECRET**

- **Purpose**: Secret for signing JWT tokens
- **Required**: YES for authentication
- **Security**: CRITICAL - Must be strong and unique per environment
- **Usage**: User session management
- **Minimum**: 32 characters recommended

#### **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID**

- **Purpose**: WalletConnect v2 project identifier
- **Required**: YES for wallet connections
- **Usage**: Enables wallet connections via WalletConnect protocol
- **Get it from**: https://cloud.walletconnect.com/
- **Example**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id`

### 🌐 Network & RPC Configuration

#### **NEXT_PUBLIC_FORK_NODE_URL**

- **Purpose**: Override RPC endpoint for development/testing
- **Required**: NO
- **Usage**: Takes precedence over Alchemy when set
- **Use cases**:
  - Local Anvil/Hardhat forks
  - Testing contract interactions
  - Debugging transactions
- **Example**: `NEXT_PUBLIC_FORK_NODE_URL=http://localhost:8545`

#### **NEXT_PUBLIC_CONDUIT_KEY**

- **Purpose**: API key for Conduit RPC (Derive chain)
- **Required**: YES for Derive tenant
- **Usage**: Constructs RPC URLs for Derive mainnet/testnet
- **Format**: Used in URL: `https://rpc.derive.xyz/{key}`

#### **DAONODE_URL_TEMPLATE**

- **Purpose**: Template for DAO-specific data endpoints
- **Required**: YES
- **Format**: `https://{TENANT_NAMESPACE}.{service-url}/`
- **Usage**: Fetches proposal details, voting data
- **Variables**: `{TENANT_NAMESPACE}` is replaced with instance name

### 📦 External Services

#### **TENDERLY_USER**, **TENDERLY_PROJECT**, **TENDERLY_ACCESS_KEY**

- **Purpose**: Transaction simulation for proposal execution
- **Required**: NO (simulation features disabled if missing)
- **Usage**: Simulates proposal execution before voting
- **Get credentials**: https://dashboard.tenderly.co/
- **Related**: All three must be set for simulation to work

#### **PINATA_API_KEY**, **PINATA_SECRET_API_KEY**, **PINATA_JWT**

- **Purpose**: IPFS file storage via Pinata
- **Required**: NO (IPFS features disabled if missing)
- **Usage**: Stores proposal descriptions and supporting documents
- **Priority**: `PINATA_JWT` preferred over API key/secret pair
- **Get credentials**: https://pinata.cloud/

#### **PR_BOT_TOKEN**

- **Purpose**: GitHub token for creating pull requests
- **Required**: NO (PR creation disabled if missing)
- **Usage**: Creates PRs for ENS executable proposals
- **Permissions**: Requires repo write access
- **Related**: Works with `ENVIRONMENT` variable

#### **NEXT_PUBLIC_ETHERSCAN_API_KEY**

- **Purpose**: Etherscan API for contract verification and ABI fetching
- **Required**: Recommended
- **Usage**:
  - Fetches contract ABIs dynamically
  - Decodes transaction data
  - Verifies contract source code
- **Rate limits**: Free tier has limits, monitor usage

### 🎛️ Feature Flags

#### **NEXT_PUBLIC_SIWE_ENABLED**

- **Purpose**: Enable Sign-In with Ethereum
- **Required**: NO
- **Values**: `"true"` to enable, any other value disables
- **Impact**: Allows wallet-based authentication
- **Default**: Disabled

#### **NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE**

- **Purpose**: Enable analytics event tracking
- **Required**: NO
- **Values**: `"true"` to enable
- **Impact**: Sends usage metrics to analytics endpoint
- **Default**: Disabled
- **Related**: Requires `NEXT_PUBLIC_AGORA_API_KEY`

#### **NEXT_PUBLIC_MUTE_QUERY_LOGGING**

- **Purpose**: Disable database query logging
- **Required**: NO
- **Values**: `"true"` to disable logging
- **Use case**: Reduce noise in development logs
- **Default**: Logging enabled

### 📊 Monitoring & Analytics

#### **DD_API_KEY**, **DD_APP_KEY**

- **Purpose**: DataDog monitoring integration
- **Required**: NO (monitoring disabled if missing)
- **Usage**: Sends application metrics and alerts
- **Related**: Must set `ENABLE_DD_METRICS=true`

#### **ENABLE_DD_METRICS**

- **Purpose**: Toggle DataDog metrics collection
- **Required**: NO
- **Values**: `"true"` to enable
- **Default**: Disabled
- **Note**: Both DD keys must be set for this to work

### 🚀 Deployment

#### **NODE_ENV**

- **Purpose**: Node.js environment mode
- **Required**: Automatically set by Next.js
- **Values**: `"production"`, `"development"`, `"test"`
- **Impact**:
  - Production mode enables optimizations and stricter error handling
  - Development mode enables hot reload and detailed error messages
  - Controls Prisma client behavior and caching
- **Note**: Set automatically by `next dev` (development) and `next build` (production)

#### **NEXT_RUNTIME**

- **Purpose**: Next.js runtime environment
- **Required**: Automatically set by Next.js
- **Values**: `"nodejs"`, `"edge"`
- **Usage**: Used in instrumentation to load appropriate telemetry
- **Note**: Don't set manually unless debugging

#### **NEXT_PHASE**

- **Purpose**: Next.js build phase indicator
- **Required**: Automatically set during build
- **Values**: `"phase-production-build"`, `"phase-development-server"`, etc.
- **Usage**: Can be used to prevent database queries during build time
- **Note**: Referenced in commented code for build-time safety checks

#### **VERCEL_ENV**, **VERCEL_REGION**, **VERCEL_URL**, etc.

- **Purpose**: Vercel deployment metadata
- **Required**: Automatically set by Vercel
- **Usage**: OpenTelemetry tracing attributes for monitoring
- **Variables**:
  - `VERCEL_ENV`: Deployment environment (production/preview/development)
  - `VERCEL_REGION`: Deployment region
  - `VERCEL_GIT_COMMIT_SHA`: Git commit SHA for the deployment
  - `VERCEL_URL`: Deployment URL
  - `VERCEL_BRANCH_URL`: Branch-specific deployment URL
- **Note**: Don't set manually - Vercel provides these automatically

#### **NEXT_PUBLIC_AGORA_BASE_URL**

- **Purpose**: Application base URL for metadata
- **Required**: YES
- **Usage**: Used in wallet connection metadata and API calls
- **Format**: Full URL including protocol
- **Example**: `NEXT_PUBLIC_AGORA_BASE_URL=https://vote.ens.domains`

#### **NEXT_PUBLIC_AGORA_ROOT**

- **Purpose**: Application root path
- **Required**: NO
- **Default**: `"/"`
- **Usage**: For deploying under a subpath
- **Example**: `NEXT_PUBLIC_AGORA_ROOT=/governance`

### 🧪 Testing & Development

#### **REACT_APP_DEPLOY_ENV**

- **Purpose**: Controls Snapshot space selection
- **Required**: NO
- **Values**: `"prod"` for production space
- **Impact**: Determines which Snapshot space proposals are created in

#### **TESTNET_SNAPSHOT_SPACE**

- **Purpose**: Override testnet Snapshot space
- **Required**: NO
- **Default**: `"michaelagora.eth"`
- **Usage**: Custom Snapshot space for testing

#### **ENVIRONMENT**

- **Purpose**: GitHub repository targeting
- **Required**: NO
- **Values**: `"prod"` targets main repo, others target fork
- **Usage**: Controls where ENS proposal PRs are created

### 🔧 Advanced Features

#### **NEXT_PUBLIC_ALCHEMY_SMART_ACCOUNT**

- **Purpose**: Alchemy API key for smart account features
- **Required**: NO (smart accounts disabled if missing)
- **Usage**: Enables account abstraction features
- **Get it from**: Alchemy dashboard (separate from regular API key)

#### **PAYMASTER_SECRET**

- **Purpose**: Secret for paymaster service integration
- **Required**: NO (paymaster features disabled if missing)
- **Usage**: Enables sponsored transactions

#### **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY**

- **Purpose**: AWS credentials for S3 and other services
- **Required**: NO (AWS features disabled if missing)
- **Usage**:
  - DynamoDB access for certain features
  - S3 bucket operations
- **Security**: Use IAM roles in production when possible

#### **STORAGE_BUCKET_URL**

- **Purpose**: Base URL for storage bucket
- **Required**: NO
- **Usage**: Fetches contract ABIs from backup storage
- **Format**: Full URL with trailing slash
- **Example**: `STORAGE_BUCKET_URL=https://my-bucket.s3.amazonaws.com/`

### 📋 Environment Setup Guide

#### Minimum Required for Development:

```bash
# Core Configuration
NEXT_PUBLIC_AGORA_INSTANCE_NAME=ens
NEXT_PUBLIC_AGORA_INSTANCE_TOKEN=ENS
NEXT_PUBLIC_AGORA_ENV=dev

# API Keys
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_AGORA_API_KEY=your_agora_api_key

# URLs
NEXT_PUBLIC_AGORA_BASE_URL=http://localhost:3000/api/v1
DAONODE_URL_TEMPLATE=https://.../

# Database (choose one approach)
# Option 1: Direct URL
DATABASE_URL=postgres://user:password@host/database
# Option 2: Environment-specific URLs
READ_WRITE_WEB2_DATABASE_URL_DEV=postgres://...
READ_ONLY_WEB3_DATABASE_URL_DEV=postgres://...
```

#### Additional for Full Features:

- Add Tenderly credentials for simulation
- Add Pinata credentials for IPFS
- Add gas sponsor keys for gasless transactions
- Add monitoring keys for production

#### Security Best Practices:

1. Never commit `.env` files with real credentials
2. Use different keys for development and production
3. Rotate private keys regularly
4. Monitor API key usage in provider dashboards
5. Use environment-specific databases
6. Keep server-side keys out of `NEXT_PUBLIC_*` variables

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

1. be wrapped in a `React.cache` invocation
2. by default, _only_ export cache-wrapped data accesses, to prevent unintentional mutliple fetching

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

## Generating API Keys

Agora Staff can generate API keys using:

```
npm run generate-apikey -- --email user@example.com --address 0x123345 --chain-id 1 --description "API access for..."
```

If for any reason you need an API key for a new chain, you'll need to run something like this against prod:

```
INSERT INTO agora."chain" (id,  name,      created_at,  updated_at) VALUES
                          ('10','Optimism','2025-06-09','2025-06-09');
```

...where id is the chain id.
