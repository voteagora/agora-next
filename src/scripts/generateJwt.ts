/*
  This script is used to generate JWT tokens for the Agora API.

  The secret required to sign the JWT should be stored in the JWT_SECRET
  environment variable.
*/
import { generateJwt } from "@/app/lib/auth/serverAuth";

// accept user ID as argument, scope and ttl as optional arguments
let scope = [""];
let ttl = 60 * 60 * 24;
if (process.argv.length < 3) {
  console.error("User ID is required");
  process.exit(1);
}

const userId = process.argv[2];
if (!userId) {
  console.error("User ID is required");
  process.exit(1);
}

if (process.env.JWT_SECRET === undefined) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

if (process.argv.length == 4) {
  scope = [process.argv[3]];
}

if (process.argv.length == 5) {
  ttl = Number(process.argv[4]);
}

(async () => {
  try {
    const token = await generateJwt(userId, scope, ttl);
    console.log(`UserId: ${userId}`);
    console.log(`scope: ${scope}`);
    console.log(`ttl: ${ttl}`);
    console.log(`Token: ${token}`);
  } catch (e) {
    console.error("Error generating JWT token:", e);
    process.exit(1);
  }
})();
