"use server";

import { Prisma, type DaoSlug } from "@prisma/client";
import { z } from "zod";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { reverseResolveENSName } from "@/app/lib/ENSUtils";
import { verifyAuth } from "@/lib/auth/authHelpers";
import { verifyCivicPrivyMembership } from "@/lib/auth/civicPrivyMembership";
import { moderateTextContent, isContentNSFW } from "@/lib/moderation";
import { checkPermission } from "@/lib/rbac";
import Tenant from "@/lib/tenant/tenant";

import { logForumAuditAction } from "./admin";
import {
  canViewForumSurveyResults,
  getForumSurveyStatus,
} from "./surveyAccess";
import { isForumSurveysEnabled } from "./surveyFeature";
import {
  closeForumSurveySchema,
  surveySubmissionSchema,
  surveyViewerSchema,
  type CloseForumSurveyInput,
  type SurveySubmissionInput,
  type SurveyViewerInput,
} from "./surveySchemas";
import type {
  ForumSurveyActionResult,
  ForumSurveyAnswerDto,
  ForumSurveyDto,
  ForumSurveyErrorCode,
  ForumSurveyRespondentDto,
  ForumSurveyViewerDto,
  ForumSurveyViewerResponseDto,
} from "./surveyTypes";
import { validateSurveyAnswers } from "./surveyValidation";

export type {
  SurveyDefinitionInput,
  SurveySubmissionInput,
} from "./surveySchemas";
export type { ForumSurveyDto } from "./surveyTypes";

type SurveyBase = Awaited<ReturnType<typeof findSurvey>>;

function surveyError<T>(
  error: string,
  code: ForumSurveyErrorCode
): ForumSurveyActionResult<T> {
  return { success: false, error, code };
}

function requireSurveyFeature<T>(): ForumSurveyActionResult<T> | null {
  return isForumSurveysEnabled()
    ? null
    : surveyError("Polls and surveys are not available here", "DISABLED");
}

function mapResponse(response: any): ForumSurveyViewerResponseDto {
  return {
    id: response.id,
    createdAt: response.createdAt.toISOString(),
    answers: response.answers.map(
      (answer: any): ForumSurveyAnswerDto => ({
        questionId: answer.questionId,
        optionIds: answer.selectedOptions.map(
          (selected: any) => selected.optionId
        ),
        text: answer.text ?? null,
      })
    ),
  };
}

async function findSurvey(where: {
  topicId?: number;
  key?: string;
  id?: number;
}) {
  const { slug } = Tenant.current();
  return prismaWeb2Client.forumSurvey.findFirst({
    where: {
      ...where,
      dao_slug: slug,
      topic: { is: { dao_slug: slug, deletedAt: null, isNsfw: false } },
    },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          address: true,
          posts: {
            where: { deletedAt: null, isNsfw: false },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { content: true },
          },
        },
      },
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } },
      },
      _count: { select: { responses: true } },
    },
  });
}

async function resolveViewer(
  survey: NonNullable<SurveyBase>,
  viewerInput?: SurveyViewerInput
): Promise<{
  viewer: ForumSurveyViewerDto;
  address: string | null;
  canViewResults: boolean;
}> {
  const parsedViewer = surveyViewerSchema.parse(viewerInput);
  const status = getForumSurveyStatus(survey);
  let address: string | null = null;
  let authenticated = false;
  let isMember = false;
  let verification:
    | {
        code: "UNAUTHENTICATED" | "NOT_MEMBER" | "VERIFICATION_FAILED";
        error: string;
      }
    | undefined;

  if (parsedViewer?.privyAccessToken) {
    const membership = await verifyCivicPrivyMembership(
      parsedViewer.privyAccessToken,
      parsedViewer.address
    );
    authenticated = membership.authenticated;
    if (membership.success) {
      address = membership.address.toLowerCase();
      isMember = true;
    } else {
      verification = { code: membership.code, error: membership.error };
    }
  } else if (
    parsedViewer?.address &&
    (parsedViewer.jwt || (parsedViewer.message && parsedViewer.signature))
  ) {
    const authResult = await verifyAuth(
      {
        jwt: parsedViewer.jwt,
        message: parsedViewer.message,
        signature: parsedViewer.signature as `0x${string}` | undefined,
      },
      parsedViewer.address as `0x${string}`
    );
    if (authResult.success) {
      authenticated = true;
      address = authResult.address.toLowerCase();
    } else {
      verification = { code: "UNAUTHENTICATED", error: authResult.error };
    }
  } else {
    verification = {
      code: "UNAUTHENTICATED",
      error: "Sign in to respond",
    };
  }

  const response = address
    ? await prismaWeb2Client.forumSurveyResponse.findFirst({
        where: {
          dao_slug: Tenant.current().slug,
          surveyId: survey.id,
          address: { equals: address, mode: "insensitive" },
        },
        include: {
          answers: {
            orderBy: { question: { position: "asc" } },
            include: { selectedOptions: true },
          },
        },
      })
    : null;

  const isAuthor =
    address != null && survey.topic.address.toLowerCase() === address;
  const isModerator =
    address != null &&
    (await checkPermission(
      address,
      Tenant.current().slug as DaoSlug,
      "forums",
      "topics",
      "archive"
    ));
  const canViewResults = canViewForumSurveyResults(status, {
    hasResponded: Boolean(response),
    isAuthor,
    isModerator,
  });
  const mappedResponse = response ? mapResponse(response) : null;

  return {
    address,
    canViewResults,
    viewer: {
      authenticated,
      isMember,
      canRespond: status === "open" && isMember && !response,
      hasResponded: Boolean(response),
      response: mappedResponse,
      address,
      ...verification,
    },
  };
}

async function loadVisibleResponses(
  survey: NonNullable<SurveyBase>,
  viewerInput?: SurveyViewerInput
): Promise<{
  countsByOption: Map<number, number>;
  responses: ForumSurveyRespondentDto[];
  offset: number;
  limit: number;
}> {
  const { slug } = Tenant.current();
  const offset = viewerInput?.responseOffset ?? 0;
  const limit = viewerInput?.responseLimit ?? 20;
  const [selectedOptions, rows] = await Promise.all([
    prismaWeb2Client.forumSurveyAnswerOption.findMany({
      where: {
        dao_slug: slug,
        answer: { response: { dao_slug: slug, surveyId: survey.id } },
      },
      select: { optionId: true },
    }),
    prismaWeb2Client.forumSurveyResponse.findMany({
      where: { dao_slug: slug, surveyId: survey.id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip: offset,
      take: limit,
      include: {
        answers: {
          orderBy: { question: { position: "asc" } },
          include: { selectedOptions: true },
        },
      },
    }),
  ]);

  const countsByOption = new Map<number, number>();
  selectedOptions.forEach(({ optionId }) => {
    countsByOption.set(optionId, (countsByOption.get(optionId) ?? 0) + 1);
  });

  const addresses = [...new Set(rows.map((row) => row.address.toLowerCase()))];
  const [deletedRows, statements] = await Promise.all([
    addresses.length
      ? prismaWeb2Client.deletedAccounts.findMany({
          where: {
            dao_slug: slug,
            address: { in: addresses, mode: "insensitive" },
          },
          select: { address: true },
        })
      : [],
    addresses.length
      ? prismaWeb2Client.delegateStatements.findMany({
          where: {
            dao_slug: slug,
            address: { in: addresses, mode: "insensitive" },
            username: { not: null },
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          select: { address: true, username: true },
        })
      : [],
  ]);
  const deleted = new Set(deletedRows.map((row) => row.address.toLowerCase()));
  const usernames = new Map<string, string>();
  statements.forEach((statement) => {
    const normalized = statement.address.toLowerCase();
    if (statement.username && !usernames.has(normalized)) {
      usernames.set(normalized, statement.username);
    }
  });

  const displayNames = new Map<string, string>();
  await Promise.all(
    addresses.map(async (address) => {
      if (deleted.has(address)) {
        displayNames.set(address, "Removed account");
        return;
      }
      displayNames.set(
        address,
        usernames.get(address) ??
          (await reverseResolveENSName(address)) ??
          address
      );
    })
  );

  return {
    countsByOption,
    offset,
    limit,
    responses: rows.map((row) => {
      const address = row.address.toLowerCase();
      const isDeleted = deleted.has(address);
      return {
        ...mapResponse(row),
        address: isDeleted ? null : address,
        displayName: displayNames.get(address) ?? address,
        isDeleted,
      };
    }),
  };
}

async function mapSurvey(
  survey: NonNullable<SurveyBase>,
  viewerInput?: SurveyViewerInput
): Promise<ForumSurveyDto> {
  const status = getForumSurveyStatus(survey);
  const viewerState = await resolveViewer(survey, viewerInput);
  const visible = viewerState.canViewResults
    ? await loadVisibleResponses(survey, viewerInput)
    : null;

  return {
    id: survey.id,
    topicId: survey.topicId,
    title: survey.topic.title,
    description: survey.topic.posts[0]?.content ?? null,
    key: survey.key,
    kind: survey.kind,
    closesAt: survey.closesAt?.toISOString() ?? null,
    closedAt: survey.closedAt?.toISOString() ?? null,
    status,
    isOpen: status === "open",
    responseCount: survey._count.responses,
    canViewResults: viewerState.canViewResults,
    viewer: viewerState.viewer,
    viewerResponse: viewerState.viewer.response,
    questions: survey.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      type: question.type,
      required: question.required,
      maxSelections: question.maxSelections,
      position: question.position,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label,
        position: option.position,
        order: option.position,
        ...(visible
          ? { responseCount: visible.countsByOption.get(option.id) ?? 0 }
          : {}),
      })),
    })),
    ...(visible
      ? {
          responses: visible.responses,
          responsePagination: {
            offset: visible.offset,
            limit: visible.limit,
            total: survey._count.responses,
            hasMore:
              visible.offset + visible.responses.length <
              survey._count.responses,
          },
        }
      : {}),
  };
}

async function getSurveyResult(
  where: { topicId?: number; key?: string; id?: number },
  viewer?: SurveyViewerInput
): Promise<ForumSurveyActionResult<ForumSurveyDto>> {
  const featureError = requireSurveyFeature<ForumSurveyDto>();
  if (featureError) return featureError;

  try {
    const survey = await findSurvey(where);
    if (!survey) return surveyError("Poll not found", "NOT_FOUND");
    return { success: true, data: await mapSurvey(survey, viewer) };
  } catch (error) {
    console.error("Failed to load forum survey", error);
    return surveyError("We couldn’t load this poll", "ERROR");
  }
}

export async function getForumSurveyByTopic(
  topicId: number,
  viewer?: SurveyViewerInput
): Promise<ForumSurveyActionResult<ForumSurveyDto>> {
  if (!Number.isInteger(topicId) || topicId < 1) {
    return surveyError("Poll not found", "NOT_FOUND");
  }
  return getSurveyResult({ topicId }, viewer);
}

/** Backwards-compatible name for topic loaders. */
export async function getForumSurvey(
  topicId: number,
  viewer?: SurveyViewerInput
): Promise<ForumSurveyActionResult<ForumSurveyDto>> {
  return getForumSurveyByTopic(topicId, viewer);
}

export async function getForumSurveyByKey(
  key: string,
  viewer?: SurveyViewerInput
): Promise<ForumSurveyActionResult<ForumSurveyDto>> {
  const normalizedKey = key.trim();
  if (!normalizedKey) return surveyError("Poll not found", "NOT_FOUND");
  return getSurveyResult({ key: normalizedKey }, viewer);
}

export async function getForumSurveyViewerState(
  surveyId: number,
  viewer?: SurveyViewerInput
): Promise<
  ForumSurveyActionResult<{
    surveyId: number;
    topicId: number;
    status: "open" | "closed";
    viewer: ForumSurveyViewerDto;
  }>
> {
  const result = await getSurveyResult({ id: surveyId }, viewer);
  if (!result.success) return result;
  return {
    success: true,
    data: {
      surveyId: result.data.id,
      topicId: result.data.topicId,
      status: result.data.status,
      viewer: result.data.viewer,
    },
  };
}

export async function submitForumSurvey(input: SurveySubmissionInput): Promise<
  ForumSurveyActionResult<{
    surveyId: number;
    topicId: number;
    responseId: number;
  }>
> {
  const featureError = requireSurveyFeature<{
    surveyId: number;
    topicId: number;
    responseId: number;
  }>();
  if (featureError) return featureError;

  let parsed: z.infer<typeof surveySubmissionSchema>;
  try {
    parsed = surveySubmissionSchema.parse(input);
  } catch (error) {
    return surveyError(
      error instanceof z.ZodError
        ? (error.errors[0]?.message ?? "That response isn’t valid")
        : "That response isn’t valid",
      "INVALID_RESPONSE"
    );
  }

  const membership = await verifyCivicPrivyMembership(parsed.privyAccessToken);
  if (!membership.success) {
    return surveyError(membership.error, membership.code);
  }
  const address = membership.address.toLowerCase();
  const { slug } = Tenant.current();

  try {
    const survey = await prismaWeb2Client.forumSurvey.findFirst({
      where: {
        id: parsed.surveyId,
        dao_slug: slug,
        topic: { is: { dao_slug: slug, deletedAt: null, isNsfw: false } },
      },
      include: {
        questions: { include: { options: { select: { id: true } } } },
      },
    });
    if (!survey) return surveyError("Poll not found", "NOT_FOUND");
    if (getForumSurveyStatus(survey) === "closed") {
      return surveyError("This poll is closed", "CLOSED");
    }

    const validation = validateSurveyAnswers(survey.questions, parsed.answers);
    if (!validation.success) {
      return surveyError(validation.error, "INVALID_RESPONSE");
    }

    const freeText = validation.answers
      .map((answer) => answer.text)
      .filter((text): text is string => Boolean(text));
    if (freeText.length > 0) {
      const moderation = await moderateTextContent(freeText.join("\n\n"), {
        failOnError: true,
      });
      if (isContentNSFW(moderation)) {
        return surveyError(
          "That response couldn’t be posted. Please revise and try again.",
          "CONTENT_REJECTED"
        );
      }
    }

    const response = await prismaWeb2Client.$transaction(
      async (tx) => {
        const [current, existingResponse] = await Promise.all([
          tx.forumSurvey.findFirst({
            where: {
              id: survey.id,
              dao_slug: slug,
              topic: {
                is: { dao_slug: slug, deletedAt: null, isNsfw: false },
              },
            },
            select: {
              id: true,
              topicId: true,
              closesAt: true,
              closedAt: true,
            },
          }),
          tx.forumSurveyResponse.findFirst({
            where: {
              dao_slug: slug,
              surveyId: survey.id,
              address: { equals: address, mode: "insensitive" },
            },
            select: { id: true },
          }),
        ]);
        if (!current) throw new Error("SURVEY_NOT_FOUND");
        if (getForumSurveyStatus(current) === "closed") {
          throw new Error("SURVEY_CLOSED");
        }
        if (existingResponse) throw new Error("ALREADY_RESPONDED");

        return tx.forumSurveyResponse.create({
          data: {
            dao_slug: slug,
            surveyId: current.id,
            address,
            answers: {
              create: validation.answers.map((answer) => ({
                dao_slug: slug,
                question: { connect: { id: answer.questionId } },
                text: answer.text,
                selectedOptions: {
                  create: answer.optionIds.map((optionId) => ({
                    dao_slug: slug,
                    option: { connect: { id: optionId } },
                  })),
                },
              })),
            },
          },
          select: {
            id: true,
            surveyId: true,
            survey: { select: { topicId: true } },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return {
      success: true,
      data: {
        surveyId: response.surveyId,
        topicId: response.survey.topicId,
        responseId: response.id,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return surveyError("You already responded", "ALREADY_RESPONDED");
    }
    if (error instanceof Error && error.message === "SURVEY_CLOSED") {
      return surveyError("This poll is closed", "CLOSED");
    }
    if (error instanceof Error && error.message === "SURVEY_NOT_FOUND") {
      return surveyError("Poll not found", "NOT_FOUND");
    }
    if (error instanceof Error && error.message === "ALREADY_RESPONDED") {
      return surveyError("You already responded", "ALREADY_RESPONDED");
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      const [existingResponse, latestSurvey] = await Promise.all([
        prismaWeb2Client.forumSurveyResponse.findFirst({
          where: {
            dao_slug: slug,
            surveyId: parsed.surveyId,
            address: { equals: address, mode: "insensitive" },
          },
          select: { id: true },
        }),
        prismaWeb2Client.forumSurvey.findFirst({
          where: {
            id: parsed.surveyId,
            dao_slug: slug,
            topic: {
              is: { dao_slug: slug, deletedAt: null, isNsfw: false },
            },
          },
          select: { closesAt: true, closedAt: true },
        }),
      ]);
      if (existingResponse) {
        return surveyError("You already responded", "ALREADY_RESPONDED");
      }
      if (latestSurvey && getForumSurveyStatus(latestSurvey) === "closed") {
        return surveyError("This poll is closed", "CLOSED");
      }
      return surveyError(
        "Something changed. Please refresh and try again.",
        "ERROR"
      );
    }
    console.error("Failed to submit forum survey response", error);
    return surveyError("We couldn’t submit that. Please try again.", "ERROR");
  }
}

export async function submitForumSurveyResponse(
  input: SurveySubmissionInput
): ReturnType<typeof submitForumSurvey> {
  return submitForumSurvey(input);
}

export async function closeForumSurvey(input: CloseForumSurveyInput): Promise<
  ForumSurveyActionResult<{
    surveyId: number;
    topicId: number;
    closedAt: string;
  }>
> {
  const featureError = requireSurveyFeature<{
    surveyId: number;
    topicId: number;
    closedAt: string;
  }>();
  if (featureError) return featureError;

  let parsed: z.infer<typeof closeForumSurveySchema>;
  try {
    parsed = closeForumSurveySchema.parse(input);
  } catch (error) {
    return surveyError(
      error instanceof z.ZodError
        ? (error.errors[0]?.message ?? "That close request isn’t valid")
        : "That close request isn’t valid",
      "FORBIDDEN"
    );
  }

  const authResult = await verifyAuth(
    {
      jwt: parsed.jwt,
      message: parsed.message,
      signature: parsed.signature as `0x${string}` | undefined,
    },
    parsed.address as `0x${string}`
  );
  if (!authResult.success) {
    return surveyError(authResult.error, "UNAUTHENTICATED");
  }
  const address = authResult.address.toLowerCase();
  const { slug } = Tenant.current();

  try {
    const survey = await prismaWeb2Client.forumSurvey.findFirst({
      where: {
        id: parsed.surveyId,
        dao_slug: slug,
        topic: { is: { dao_slug: slug, deletedAt: null, isNsfw: false } },
      },
      select: {
        id: true,
        topicId: true,
        closedAt: true,
        topic: { select: { address: true } },
      },
    });
    if (!survey) return surveyError("Poll not found", "NOT_FOUND");

    const isAuthor = survey.topic.address.toLowerCase() === address;
    const isModerator = await checkPermission(
      address,
      slug as DaoSlug,
      "forums",
      "topics",
      "archive"
    );
    if (!isAuthor && !isModerator) {
      return surveyError(
        "Only the author or a moderator can close this",
        "FORBIDDEN"
      );
    }

    const { closed, didClose } = survey.closedAt
      ? { closed: survey, didClose: false }
      : await prismaWeb2Client.$transaction(
          async (tx) => {
            const update = await tx.forumSurvey.updateMany({
              where: {
                id: survey.id,
                dao_slug: slug,
                closedAt: null,
              },
              data: { closedAt: new Date(), closedBy: address },
            });
            const closed = await tx.forumSurvey.findFirstOrThrow({
              where: { id: survey.id, dao_slug: slug },
              select: { id: true, topicId: true, closedAt: true },
            });
            return { closed, didClose: update.count === 1 };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );
    if (didClose) {
      await logForumAuditAction(
        slug,
        address,
        "CLOSE_SURVEY",
        "topic",
        survey.topicId
      );
    }

    return {
      success: true,
      data: {
        surveyId: closed.id,
        topicId: closed.topicId,
        closedAt: closed.closedAt!.toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to close forum survey", error);
    return surveyError("We couldn’t close this poll", "ERROR");
  }
}
