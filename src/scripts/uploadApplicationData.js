const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const applications = require("../../applications.json");

  console.log(applications.length);

  for (const application of applications) {
    const category = parseCategory(application);

    console.log(category);

    await prisma.impactStatements.upsert({
      where: {
        application_id: category.application_id,
      },
      update: {
        category: category.category,
        subcategory: category.subcategory,
        impact_statement: {
          create: category.impact_statement,
        },
      },
      create: category,
    });
  }

  console.log("Projects data loaded successfully.");
}

function parseCategory(category) {
  switch (category.category.name) {
    case "OP Stack Research & Development":
      return {
        application_id: category.attestationId,
        round: 5,
        category: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
        subcategory: category.projectDescriptionOptions,
        impact_statement: category.impactStatementAnswer.map((answer) => {
          return {
            answer: answer.answer,
            question: answer.impactStatement.question,
          };
        }),
      };
    case "OP Stack Tooling":
      return {
        application_id: category.attestationId,
        round: 5,
        category: "OP_STACK_TOOLING",
        subcategory: category.projectDescriptionOptions,
        impact_statement: category.impactStatementAnswer.map((answer) => {
          return {
            answer: answer.answer,
            question: answer.impactStatement.question,
          };
        }),
      };
    case "Ethereum Core Contributors":
      return {
        application_id: category.attestationId,
        round: 5,
        category: "ETHEREUM_CORE_CONTRIBUTIONS",
        subcategory: category.projectDescriptionOptions,
        impact_statement: category.impactStatementAnswer.map((answer) => {
          return {
            answer: answer.answer,
            question: answer.impactStatement.question,
          };
        }),
      };
  }
}

main();
