import { describe, expect, it } from "vitest";
import type { SurveyDefinitionInput } from "@/lib/actions/forum/surveys";
import { validateSurveyDefinition } from "./ForumSurveyBuilder";

describe("validateSurveyDefinition", () => {
  it("accepts a valid poll", () => {
    const poll: SurveyDefinitionInput = {
      kind: "poll",
      questions: [
        {
          prompt: "What should we discuss next?",
          type: "single_choice",
          required: true,
          options: ["Harm prevention", "Peacekeeping"],
        },
      ],
    };

    expect(validateSurveyDefinition(poll)).toEqual([]);
  });

  it("rejects an invalid poll shape and duplicate options", () => {
    const poll: SurveyDefinitionInput = {
      kind: "poll",
      questions: [
        {
          prompt: "Choose one",
          type: "multiple_choice",
          required: true,
          maxSelections: 2,
          options: ["Africa", "africa"],
        },
      ],
    };

    expect(validateSurveyDefinition(poll)).toEqual(
      expect.arrayContaining([
        "A poll needs exactly one multiple-choice question (pick one).",
        "Question 1 has duplicate options.",
      ])
    );
  });

  it("requires the poll question", () => {
    const poll: SurveyDefinitionInput = {
      kind: "poll",
      questions: [
        {
          prompt: "Choose one",
          type: "single_choice",
          required: false,
          options: ["Africa", "MENA"],
        },
      ],
    };

    expect(validateSurveyDefinition(poll)).toContain(
      "A poll needs exactly one multiple-choice question (pick one)."
    );
  });

  it("validates multi-choice limits and future deadlines", () => {
    const survey: SurveyDefinitionInput = {
      kind: "survey",
      closesAt: new Date(Date.now() - 60_000),
      questions: [
        {
          prompt: "Where should CIVIC focus?",
          type: "multiple_choice",
          required: false,
          maxSelections: 3,
          options: ["Africa", "MENA"],
        },
      ],
    };

    expect(validateSurveyDefinition(survey)).toEqual(
      expect.arrayContaining([
        "Question 1's maximum selections must be between 1 and its option count.",
        "Choose a deadline in the future.",
      ])
    );
  });
});
