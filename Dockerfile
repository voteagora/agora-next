# Stage 1: Dependencies
FROM ubuntu:20.04 AS deps

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x

# Install Node.js and build dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    git \
    libssl1.1 \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM ubuntu:20.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install Node.js and libssl1.1
RUN apt-get update && apt-get install -y \
    curl \
    libssl1.1 \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set Node options for more memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Need to make sure these are set at build time... (yes the build needs the DB)
# ENV NEXT_PUBLIC_AGORA_ENV=...
# ENV NEXT_PUBLIC_ALCHEMY_ID=...
# ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
# ENV NEXT_PUBLIC_AGORA_API_KEY=...

# These should come from config based on tenant config
# ENV NEXT_PUBLIC_AGORA_INSTANCE_TOKEN=..
# ENV NEXT_PUBLIC_AGORA_INSTANCE_NAME=...
# ENV DATABASE_URL=...

# Generate Prisma client and build application
RUN npx prisma generate
RUN yarn run generate-typechain
RUN yarn build

# Stage 3: Runner
FROM ubuntu:20.04 AS runner

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install Node.js and libssl1.1
RUN apt-get update && apt-get install -y \
    curl \
    libssl1.1 \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

CMD ["yarn", "start"]