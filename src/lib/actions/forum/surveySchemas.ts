import { z } from "zod";

export const forumSurveyKindSchema = z.enum(["poll", "survey"]);
export const forumSurveyQuestionTypeSchema = z.enum([
  "single_choice",
  "multiple_choice",
  "free_text",
]);

const optionLabelSchema = z
  .string()
  .trim()
  .min(1, "Option labels cannot be empty")
  .max(200, "Option labels must be 200 characters or fewer");

export const surveyQuestionSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(1, "Question prompt is required")
      .max(500, "Question prompts must be 500 characters or fewer"),
    type: forumSurveyQuestionTypeSchema,
    required: z.boolean().default(true),
    maxSelections: z.number().int().min(1).max(10).nullable().optional(),
    options: z.array(optionLabelSchema).max(10).default([]),
  })
  .superRefine((question, context) => {
    const labels = question.options.map((option) => option.toLocaleLowerCase());
    if (new Set(labels).size !== labels.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Option labels must be unique within a question",
      });
    }

    if (question.type === "free_text") {
      if (question.options.length > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Free-text questions cannot have options",
        });
      }
      if (question.maxSelections != null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxSelections"],
          message: "Free-text questions cannot limit selections",
        });
      }
      return;
    }

    if (question.options.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 2,
        inclusive: true,
        type: "array",
        path: ["options"],
        message: "Choice questions require at least two options",
      });
    }

    if (question.type === "single_choice" && question.maxSelections != null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxSelections"],
        message: "Single-choice questions cannot set maxSelections",
      });
    }

    if (
      question.type === "multiple_choice" &&
      question.maxSelections != null &&
      question.maxSelections > question.options.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxSelections"],
        message: "maxSelections cannot exceed the number of options",
      });
    }
  });

export const surveyDefinitionSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Survey keys must be lowercase kebab-case"
      )
      .optional(),
    kind: forumSurveyKindSchema.default("survey"),
    closesAt: z.coerce.date().nullable().optional(),
    questions: z.array(surveyQuestionSchema).min(1).max(10),
  })
  .superRefine((survey, context) => {
    if (survey.kind !== "poll") return;

    if (survey.questions.length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions"],
        message: "Polls must contain exactly one question",
      });
      return;
    }

    const question = survey.questions[0];
    if (question.type !== "single_choice" || !question.required) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions", 0],
        message: "A poll must be a required single-choice question",
      });
    }
  });

export const surveyAnswerInputSchema = z
  .object({
    questionId: z.number().int().positive(),
    optionIds: z.array(z.number().int().positive()).max(10).optional(),
    text: z.string().trim().max(2_000).optional(),
  })
  .superRefine((answer, context) => {
    const optionIds = answer.optionIds ?? [];
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["optionIds"],
        message: "An option can only be selected once",
      });
    }
  });

export const surveySubmissionSchema = z.object({
  surveyId: z.number().int().positive(),
  answers: z.array(surveyAnswerInputSchema).min(1).max(10),
  privyAccessToken: z.string().min(1, "Privy access token is required"),
});

export const surveyViewerSchema = z
  .object({
    privyAccessToken: z.string().min(1).optional(),
    address: z.string().optional(),
    jwt: z.string().optional(),
    message: z.string().optional(),
    signature: z.string().optional(),
    responseLimit: z.number().int().min(1).max(50).optional(),
    responseOffset: z.number().int().min(0).optional(),
  })
  .optional();

export const closeForumSurveySchema = z.object({
  surveyId: z.number().int().positive(),
  address: z.string().min(1, "Address is required"),
  jwt: z.string().optional(),
  message: z.string().optional(),
  signature: z.string().optional(),
});

export type ForumSurveyKindInput = z.infer<typeof forumSurveyKindSchema>;
export type ForumSurveyQuestionTypeInput = z.infer<
  typeof forumSurveyQuestionTypeSchema
>;
export type SurveyQuestionInput = z.output<typeof surveyQuestionSchema>;
export type SurveyDefinitionInput = z.output<typeof surveyDefinitionSchema>;
export type SurveyAnswerInput = z.input<typeof surveyAnswerInputSchema>;
export type SurveySubmissionInput = z.input<typeof surveySubmissionSchema>;
export type SurveyViewerInput = NonNullable<z.input<typeof surveyViewerSchema>>;
export type CloseForumSurveyInput = z.input<typeof closeForumSurveySchema>;
