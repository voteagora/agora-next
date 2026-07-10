import type {
  ForumSurveyQuestionTypeInput,
  SurveyAnswerInput,
} from "./surveySchemas";

export interface SurveyQuestionForSubmission {
  id: number;
  type: ForumSurveyQuestionTypeInput;
  required: boolean;
  maxSelections: number | null;
  options: Array<{ id: number }>;
}

export interface NormalizedSurveyAnswer {
  questionId: number;
  optionIds: number[];
  text: string | null;
}

export type SurveySubmissionValidationResult =
  | { success: true; answers: NormalizedSurveyAnswer[] }
  | { success: false; error: string };

/**
 * Validates answers against the persisted definition. Keeping this separate
 * from the server action makes foreign-option and required-answer behavior
 * deterministic and unit-testable.
 */
export function validateSurveyAnswers(
  questions: SurveyQuestionForSubmission[],
  inputAnswers: SurveyAnswerInput[]
): SurveySubmissionValidationResult {
  const questionById = new Map(
    questions.map((question) => [question.id, question])
  );
  const answersByQuestionId = new Map<number, NormalizedSurveyAnswer>();

  for (const input of inputAnswers) {
    const question = questionById.get(input.questionId);
    if (!question) {
      return {
        success: false,
        error: "That answer doesn’t match this poll",
      };
    }
    if (answersByQuestionId.has(input.questionId)) {
      return {
        success: false,
        error: "Each question can only be answered once",
      };
    }

    const optionIds = input.optionIds ?? [];
    const text = input.text?.trim() || null;
    const validOptionIds = new Set(question.options.map((option) => option.id));

    // The public Zod schema rejects duplicate selections too, but keep the
    // persisted-definition validator self-contained so internal callers cannot
    // turn a duplicate into a database error (or an inflated result count).
    if (new Set(optionIds).size !== optionIds.length) {
      return {
        success: false,
        error: "You selected the same option more than once",
      };
    }

    if (optionIds.some((optionId) => !validOptionIds.has(optionId))) {
      return {
        success: false,
        error: "That answer doesn’t match this poll",
      };
    }

    if (question.type === "free_text") {
      if (optionIds.length > 0) {
        return {
          success: false,
          error: "Text answers can’t include options",
        };
      }
      if (text && text.length > 2_000) {
        return {
          success: false,
          error: "Keep your answer under 2,000 characters",
        };
      }
    } else {
      if (text) {
        return { success: false, error: "Choice answers can’t include text" };
      }
      if (question.type === "single_choice" && optionIds.length > 1) {
        return {
          success: false,
          error: "Choose only one option",
        };
      }
      if (
        question.type === "multiple_choice" &&
        question.maxSelections != null &&
        optionIds.length > question.maxSelections
      ) {
        return {
          success: false,
          error: `This question accepts at most ${question.maxSelections} selections`,
        };
      }
    }

    const isSubstantive = optionIds.length > 0 || Boolean(text);
    if (question.required && !isSubstantive) {
      return { success: false, error: "Please answer every required question" };
    }
    if (isSubstantive) {
      answersByQuestionId.set(input.questionId, {
        questionId: input.questionId,
        optionIds,
        text,
      });
    }
  }

  for (const question of questions) {
    if (question.required && !answersByQuestionId.has(question.id)) {
      return { success: false, error: "Please answer every required question" };
    }
  }

  const answers = [...answersByQuestionId.values()];
  if (answers.length === 0) {
    return { success: false, error: "Answer at least one question" };
  }

  return { success: true, answers };
}
