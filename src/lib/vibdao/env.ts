import { z } from 'zod';

const serverEnvSchema = z.object({
  VIBDAO_DATABASE_URL: z.string().optional(),
  VIBDAO_DB_HOST: z.string().default('127.0.0.1'),
  VIBDAO_DB_PORT: z.coerce.number().default(5432),
  VIBDAO_DB_NAME: z.string().default('vibly_dao'),
  VIBDAO_DB_USER: z.string().default('postgres'),
  VIBDAO_DB_PASS: z.string().default('postgres'),
  VIBDAO_DB_SCHEMA: z.string().default('web3'),
  VIBDAO_CHAIN_RPC_URL: z.string().url().default('http://127.0.0.1:8545'),
  VIBDAO_CHAIN_ID: z.coerce.number().default(31337),
  VIBDAO_CONTRACTS_DIR: z.string().default('../vibly-dao-contracts'),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL: z.string().url().default('http://127.0.0.1:8545'),
  NEXT_PUBLIC_VIBDAO_CHAIN_ID: z.coerce.number().default(31337),
});

export const env = serverEnvSchema.parse(process.env);

export function getDatabaseUrl(): string {
  if (env.VIBDAO_DATABASE_URL) return env.VIBDAO_DATABASE_URL;

  const user = encodeURIComponent(env.VIBDAO_DB_USER);
  const pass = encodeURIComponent(env.VIBDAO_DB_PASS);

  return `postgresql://${user}:${pass}@${env.VIBDAO_DB_HOST}:${env.VIBDAO_DB_PORT}/${env.VIBDAO_DB_NAME}`;
}

export function getParsedPublicEnv() {
  return publicEnvSchema.parse(process.env);
}
