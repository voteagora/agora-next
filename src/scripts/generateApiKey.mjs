/*
    This script is used to generate an API Key for the Agora SDK and add the user to the database.
    You can run this script by using the following command:
    `tsx src/scripts/generateApiKey.mjs --email user@example.com --address 0x123... --chain-id 1 --description "API access for..."`

    The generated API Key will be printed to the console. This is what will be shared with the API User.
    The hashed API Key will be stored in the database.
*/

// Prevent Next.js instrumentation from loading
process.env.NEXT_RUNTIME = "edge";

import { PrismaClient } from "@prisma/client";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const HASH_FN = "sha256";

function generateApiKey() {
  return uuidv4();
}

function hashApiKey(apiKey) {
  const hash = createHash(HASH_FN);
  hash.update(apiKey);
  return hash.digest("hex");
}

async function generateApiKeyAndCreateUser(
  email,
  address,
  chainId,
  description
) {
  try {
    const apiKey = generateApiKey();
    const hashedApiKey = hashApiKey(apiKey);

    const user = await prisma.api_user.create({
      data: {
        email,
        address,
        chain_id: chainId,
        description,
        api_key: hashedApiKey,
      },
    });

    console.log("Successfully created API user!");
    console.log("API Key (save this, it won't be shown again):", apiKey);
    console.log("User ID:", user.id);
    console.log(`Hashed API Key (${HASH_FN}):`, hashedApiKey);

    return user;
  } catch (error) {
    console.error("Error creating API user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("email", {
      type: "string",
      description: "Email address of the API user",
      required: true,
    })
    .option("address", {
      type: "string",
      required: true,
      description: "Blockchain address of the API user",
    })
    .option("chain-id", {
      type: "string",
      required: true,
      description: "Chain ID for the API user",
    })
    .option("description", {
      type: "string",
      description: "Description of the API user's purpose",
    })
    .help().argv;

  await generateApiKeyAndCreateUser(
    argv.email,
    argv.address,
    argv["chain-id"],
    argv.description
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
