import "server-only";

import type { DaoSlug, Prisma } from "@prisma/client";

import {
  surveyDefinitionSchema,
  type SurveyDefinitionInput,
} from "./surveySchemas";

/**
 * Creates an immutable survey definition inside the caller's topic-creation
 * transaction. The caller owns authorization/category checks and must pass the
 * same transaction used for the topic and root post.
 */
export async function createForumSurveyForTopic(
  tx: Prisma.TransactionClient,
  daoSlug: DaoSlug,
  topicId: number,
  definition: SurveyDefinitionInput
) {
  const survey = surveyDefinitionSchema.parse(definition);

  return tx.forumSurvey.create({
    data: {
      dao_slug: daoSlug,
      topicId,
      key: survey.key ?? null,
      kind: survey.kind,
      closesAt: survey.closesAt ?? null,
      questions: {
        create: survey.questions.map((question, questionIndex) => ({
          dao_slug: daoSlug,
          prompt: question.prompt,
          type: question.type,
          required: question.required,
          maxSelections:
            question.type === "multiple_choice"
              ? (question.maxSelections ?? null)
              : null,
          position: questionIndex,
          options: {
            create: question.options.map((label, optionIndex) => ({
              dao_slug: daoSlug,
              label,
              position: optionIndex,
            })),
          },
        })),
      },
    },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } },
      },
    },
  });
}
