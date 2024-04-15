const { PrismaClient } = require("@prisma/client");
const { DaoSlug } = require("@prisma/client");
const fs = require("fs");
const readline = require("readline");

async function main(filePath: string) {
  const prisma = new PrismaClient({});

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const delegateStatements = [];

  for await (const line of rl) {
    // console.log(line);

    // Each line in the file is a complete JSON object
    const statement = JSON.parse(line);
    delegateStatements.push({
      address: statement.SortKey.toLowerCase(),
      dao_slug: DaoSlug.OP,
      signature: statement.signature,
      payload: JSON.parse(statement.signedPayload),
      twitter: JSON.parse(statement.signedPayload)?.twitter,
      discord: JSON.parse(statement.signedPayload)?.discord,
      email: null,
    });
  }

  try {
    // Retrieve existing IDs
    const existingIds = new Set(
      (
        await prisma.delegateStatements.findMany({
          select: { address: true },
          where: {
            address: {
              in: delegateStatements.map((stmt) => stmt.address),
            },
          },
        })
      ).map((stmt: any) => stmt.address)
    );

    console.log(`${existingIds.size} existing statements found.`);
    console.log(existingIds);

    // Filter out existing records
    const newStatements = delegateStatements.filter(
      (stmt) => !existingIds.has(stmt.address)
    );

    // Bulk insert new records
    if (newStatements.length > 0) {
      await prisma.delegateStatements.createMany({
        data: newStatements,
        skipDuplicates: true, // This ensures we skip duplicates if any exist
      });
      console.log(`${newStatements.length} new statements have been added.`);
    } else {
      console.log("No new statements to add.");
    }
  } catch (error) {
    console.error("Error processing the JSONL file:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main("statements.jsonl");
