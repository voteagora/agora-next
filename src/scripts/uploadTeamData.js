const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const teams = require("./teams.json");

  console.log(teams.length);

  for (const team of teams) {
    await prisma.teamMetadata.upsert({
      where: {
        application_id: team.attestationId,
      },
      create: {
        application_id: team.attestationId,
        round: 6,
        team: team.team,
      },
      update: {},
    });
  }

  console.log("Team data loaded successfully.");
}

main();
