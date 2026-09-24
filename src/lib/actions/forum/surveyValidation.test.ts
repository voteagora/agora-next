import { describe, expect, it } from "vitest";

import { surveyDefinitionSchema } from "./surveySchemas";
import {
  validateSurveyAnswers,
  type SurveyQuestionForSubmission,
} from "./surveyValidation";

const questions: SurveyQuestionForSubmission[] = [
  {
    id: 1,
    type: "single_choice",
    required: true,
    maxSelections: null,
    options: [{ id: 10 }, { id: 11 }],
  },
  {
    id: 2,
    type: "multiple_choice",
    required: false,
    maxSelections: 2,
    options: [{ id: 20 }, { id: 21 }, { id: 22 }],
  },
  {
    id: 3,
    type: "free_text",
    required: false,
    maxSelections: null,
    options: [],
  },
];

describe("surveyDefinitionSchema", () => {
  it("accepts a valid poll preset", () => {
    const parsed = surveyDefinitionSchema.parse({
      kind: "poll",
      questions: [
        {
          prompt: "Choose one",
          type: "single_choice",
          required: true,
          options: ["One", "Two"],
        },
      ],
    });

    expect(parsed.kind).toBe("poll");
    expect(parsed.questions[0].required).toBe(true);
  });

  it("rejects a poll that is not one required single-choice question", () => {
    const result = surveyDefinitionSchema.safeParse({
      kind: "poll",
      questions: [
        {
          prompt: "Choose several",
          type: "multiple_choice",
          required: false,
          options: ["One", "Two"],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate option labels and invalid selection limits", () => {
    const result = surveyDefinitionSchema.safeParse({
      kind: "survey",
      questions: [
        {
          prompt: "Choose",
          type: "multiple_choice",
          maxSelections: 3,
          options: ["Same", "same"],
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe("validateSurveyAnswers", () => {
  it("normalizes a valid mixed response", () => {
    const result = validateSurveyAnswers(questions, [
      { questionId: 1, optionIds: [10] },
      { questionId: 2, optionIds: [20, 22] },
      { questionId: 3, text: "  A considered response  " },
    ]);

    expect(result).toEqual({
      success: true,
      answers: [
        { questionId: 1, optionIds: [10], text: null },
        { questionId: 2, optionIds: [20, 22], text: null },
        {
          questionId: 3,
          optionIds: [],
          text: "A considered response",
        },
      ],
    });
  });

  it("rejects an option belonging to a different question", () => {
    expect(
      validateSurveyAnswers(questions, [{ questionId: 1, optionIds: [20] }])
    ).toMatchObject({ success: false });
  });

  it("rejects selecting the same option more than once", () => {
    expect(
      validateSurveyAnswers(questions, [{ questionId: 1, optionIds: [10, 10] }])
    ).toEqual({
      success: false,
      error: "You selected the same option more than once",
    });
  });

  it("rejects omitted required questions", () => {
    expect(
      validateSurveyAnswers(questions, [{ questionId: 2, optionIds: [20] }])
    ).toEqual({
      success: false,
      error: "Please answer every required question",
    });
  });

  it("rejects duplicate question answers and over-selection", () => {
    expect(
      validateSurveyAnswers(questions, [
        { questionId: 1, optionIds: [10] },
        { questionId: 1, optionIds: [11] },
      ])
    ).toMatchObject({ success: false });

    expect(
      validateSurveyAnswers(questions, [
        { questionId: 1, optionIds: [10] },
        { questionId: 2, optionIds: [20, 21, 22] },
      ])
    ).toMatchObject({ success: false });
  });

  it("requires at least one substantive answer for all-optional onboarding", () => {
    const optionalQuestions = questions.map((question) => ({
      ...question,
      required: false,
    }));

    expect(
      validateSurveyAnswers(optionalQuestions, [
        { questionId: 2, optionIds: [] },
      ])
    ).toEqual({ success: false, error: "Answer at least one question" });
  });
});
