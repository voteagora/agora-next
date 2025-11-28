const { DaoSlug } = require("@prisma/client");
const fs = require("fs");
const readline = require("readline");
import { prismaWeb3Client } from "@/app/lib/web3";

async function main(
  filePath: string,
  daoSlug: typeof DaoSlug,
  checkExisting = true // use if Postges has been used as primary DB for the DAO. Otherwise, use false
) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const delegateStatements = [];

  for await (const line of rl) {
    // Each line in the file is a complete JSON object
    const statement = JSON.parse(line);
    delegateStatements.push({
      address: statement.SortKey.toLowerCase(),
      dao_slug: daoSlug,
      signature: statement.signature,
      message_hash: statement.messageHash,
      payload: JSON.parse(statement.signedPayload),
      twitter: JSON.parse(statement.signedPayload)?.twitter,
      discord: JSON.parse(statement.signedPayload)?.discord,
      email: null,
    });
  }

  try {
    // Retrieve existing IDs -- this is used when the new statments were written to Postgres
    // If migrating directly from DynamoDB, this step can be skipped
    const existingIds = checkExisting
      ? new Set(
          (
            await prismaWeb3Client.delegateStatements.findMany({
              select: { address: true },
              where: {
                address: {
                  in: delegateStatements.map((stmt) => stmt.address),
                },
                dao_slug: daoSlug,
              },
            })
          ).map((stmt: any) => stmt.address)
        )
      : new Set();

    console.log(`${existingIds.size} existing statements found.`);

    // Filter out existing records
    const newStatements = delegateStatements.filter(
      (stmt) => !existingIds.has(stmt.address)
    );

    // Bulk insert create records
    if (newStatements.length > 0) {
      await prismaWeb3Client.delegateStatements.createMany({
        data: newStatements,
        skipDuplicates: true, // This ensures we skip duplicates if any exist
      });
      console.log(`${newStatements.length} new statements have been added.`);
    } else {
      console.log("No create statements to add.");
    }
  } catch (error) {
    console.error("Error processing the JSONL file:", error);
  } finally {
    await prismaWeb3Client.$disconnect();
  }
}

main("statements.jsonl", DaoSlug.UNI, false);
