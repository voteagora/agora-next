# ---------- Stage 1: base with deps ----------
FROM node:20-slim AS deps

WORKDIR /app

# Install OS deps only if really needed (prisma builds, etc.)
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy only what's needed to install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ---------- Stage 2: builder ----------
FROM node:20-slim AS builder

WORKDIR /app

# Reuse deps layer for faster rebuilds
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment at build time
ARG NEXT_PUBLIC_AGORA_ENV
ARG DATABASE_URL
ARG NEXT_PUBLIC_ALCHEMY_ID
ARG DAONODE_URL_TEMPLATE
ARG NEXT_PUBLIC_FORK_NODE_URL
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_AGORA_INSTANCE_NAME

ENV NEXT_PUBLIC_AGORA_ENV=$NEXT_PUBLIC_AGORA_ENV
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_ALCHEMY_ID=$NEXT_PUBLIC_ALCHEMY_ID
ENV DAONODE_URL_TEMPLATE=$DAONODE_URL_TEMPLATE
ENV NEXT_PUBLIC_FORK_NODE_URL=$NEXT_PUBLIC_FORK_NODE_URL
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_AGORA_INSTANCE_NAME=$NEXT_PUBLIC_AGORA_INSTANCE_NAME

# Build
RUN npx prisma generate
RUN yarn generate-typechain
RUN yarn build

# ---------- Stage 3: runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN corepack enable && corepack prepare yarn@stable --activate && \
    groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["yarn","start"]
