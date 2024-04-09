/*
    This script is used to generate an API Key for the Agora SDK.
    You can run this script by using the following command:
    `ts-node src/scripts/generateApiKey.ts`

    The generated API Key will be printed to the console. This is 
    what will be shared with the API User.

    The hashed API Key will additionalyl be printed to the console.
    This is what will be stored in our User database table.
*/
const { createHash } = require("crypto");
const { v4 } = require("uuid");

const HASH_FN = "sha256";

function generateApiKey() {
  const apiKey = v4();
  return apiKey;
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN);
  hash.update(apiKey);
  return hash.digest("hex");
}

const apiKey = generateApiKey();
const hashedApiKey = hashApiKey(apiKey);

console.log("API Key:", apiKey);
console.log(`Hashed API Key: ${HASH_FN}, ${hashedApiKey}`);
