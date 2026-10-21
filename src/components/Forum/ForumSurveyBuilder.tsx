"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SurveyDefinitionInput } from "@/lib/actions/forum/surveys";

type SurveyQuestionInput = SurveyDefinitionInput["questions"][number];

interface ForumSurveyBuilderProps {
  value: SurveyDefinitionInput | null;
  onChange: (value: SurveyDefinitionInput | null) => void;
  disabled?: boolean;
}

const QUESTION_TYPES: Array<{
  value: SurveyQuestionInput["type"];
  label: string;
}> = [
  { value: "single_choice", label: "Single choice" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "free_text", label: "Free text" },
];

function choiceQuestion(
  type: "single_choice" | "multiple_choice" = "single_choice"
): SurveyQuestionInput {
  return {
    prompt: "",
    type,
    required: true,
    options: ["", ""],
    ...(type === "multiple_choice" ? { maxSelections: 2 } : {}),
  };
}

function createDefinition(
  kind: SurveyDefinitionInput["kind"]
): SurveyDefinitionInput {
  return {
    kind,
    questions: [
      kind === "poll"
        ? choiceQuestion("single_choice")
        : choiceQuestion("multiple_choice"),
    ],
  };
}

function localDateTimeValue(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function validateSurveyDefinition(
  definition: SurveyDefinitionInput | null
): string[] {
  if (!definition) return [];

  const errors: string[] = [];
  if (definition.questions.length < 1 || definition.questions.length > 10) {
    errors.push("Add between 1 and 10 questions.");
  }

  if (
    definition.kind === "poll" &&
    (definition.questions.length !== 1 ||
      definition.questions[0]?.type !== "single_choice" ||
      definition.questions[0]?.required !== true)
  ) {
    errors.push(
      "A poll needs exactly one multiple-choice question (pick one)."
    );
  }

  definition.questions.forEach((question, index) => {
    const label = `Question ${index + 1}`;
    if (!question.prompt.trim()) {
      errors.push(`${label} needs a question.`);
    }

    if (question.type === "free_text") return;

    const options = question.options ?? [];
    if (options.length < 2 || options.length > 10) {
      errors.push(`${label} must have between 2 and 10 options.`);
    }
    if (options.some((option) => !option.trim())) {
      errors.push(`${label} has an empty option.`);
    }
    const normalizedOptions = options.map((option) =>
      option.trim().toLowerCase()
    );
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      errors.push(`${label} has duplicate options.`);
    }

    if (
      question.type === "multiple_choice" &&
      question.maxSelections != null &&
      (!Number.isInteger(question.maxSelections) ||
        question.maxSelections < 1 ||
        question.maxSelections > options.length)
    ) {
      errors.push(
        `${label}'s maximum selections must be between 1 and its option count.`
      );
    }
  });

  if (definition.closesAt) {
    const closesAt = new Date(definition.closesAt).getTime();
    if (!Number.isFinite(closesAt) || closesAt <= Date.now()) {
      errors.push("Choose a deadline in the future.");
    }
  }

  return errors;
}

export function ForumSurveyBuilder({
  value,
  onChange,
  disabled = false,
}: ForumSurveyBuilderProps) {
  const updateQuestion = (
    index: number,
    update: (question: SurveyQuestionInput) => SurveyQuestionInput
  ) => {
    if (!value) return;
    onChange({
      ...value,
      questions: value.questions.map((question, questionIndex) =>
        questionIndex === index ? update(question) : question
      ),
    });
  };

  const setKind = (kind: SurveyDefinitionInput["kind"]) => {
    if (value?.kind === kind) return;
    onChange(createDefinition(kind));
  };

  if (!value) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-wash p-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              Ask the community
            </p>
            <p className="mt-1 text-xs text-secondary">
              Answers are public and can’t be edited after posting.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(createDefinition("poll"))}
              className="rounded-lg border border-line bg-cardBackground px-4 py-3 text-left transition-colors hover:border-brandPrimary hover:bg-neutral disabled:opacity-50"
            >
              <p className="text-sm font-semibold text-primary">Poll</p>
              <p className="mt-1 text-xs leading-5 text-secondary">
                One question. Everyone picks a single option — best for a quick
                community vote.
              </p>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(createDefinition("survey"))}
              className="rounded-lg border border-line bg-cardBackground px-4 py-3 text-left transition-colors hover:border-brandPrimary hover:bg-neutral disabled:opacity-50"
            >
              <p className="text-sm font-semibold text-primary">Survey</p>
              <p className="mt-1 text-xs leading-5 text-secondary">
                Multiple questions. Mix single choice, multiple choice, and
                written answers.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const errors = validateSurveyDefinition(value);
  const minDeadline = localDateTimeValue(new Date().toISOString());
  const kindDescription =
    value.kind === "poll"
      ? "One question, one choice each. Use this for a quick vote."
      : "Several questions. Supporters can answer with choices or short written responses.";

  return (
    <section className="space-y-5 rounded-lg border border-line bg-wash p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-primary">
            {value.kind === "poll" ? "Community poll" : "Community survey"}
          </h2>
          <p className="mt-1 text-xs text-secondary">{kindDescription}</p>
          <p className="mt-1 text-xs text-tertiary">
            After you post, questions and answers can’t be changed.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onChange(null)}
          className="text-secondary"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["poll", "survey"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => setKind(kind)}
            className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
              value.kind === kind
                ? "border-brandPrimary bg-neutral text-primary"
                : "border-line bg-cardBackground text-secondary hover:text-primary"
            }`}
          >
            <span className="block text-sm font-semibold">
              {kind === "poll" ? "Poll" : "Survey"}
            </span>
            <span className="mt-0.5 block text-[11px] leading-4 opacity-80">
              {kind === "poll"
                ? "1 question · pick one"
                : "Multiple questions · mixed answers"}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {value.questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="space-y-4 rounded-lg border border-line bg-cardBackground p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-primary">
                Question {questionIndex + 1}
              </p>
              {value.kind === "survey" && value.questions.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove question ${questionIndex + 1}`}
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...value,
                      questions: value.questions.filter(
                        (_, index) => index !== questionIndex
                      ),
                    })
                  }
                  className="rounded p-1 text-secondary hover:bg-wash hover:text-primary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`survey-question-${questionIndex}`}>
                Question
              </Label>
              <Input
                id={`survey-question-${questionIndex}`}
                value={question.prompt}
                maxLength={500}
                disabled={disabled}
                onChange={(event) =>
                  updateQuestion(questionIndex, (current) => ({
                    ...current,
                    prompt: event.target.value,
                  }))
                }
                placeholder="Ask a question…"
                className="mt-2"
              />
            </div>

            {value.kind === "survey" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`survey-type-${questionIndex}`}>
                    Answer type
                  </Label>
                  <select
                    id={`survey-type-${questionIndex}`}
                    value={question.type}
                    disabled={disabled}
                    onChange={(event) => {
                      const type = event.target
                        .value as SurveyQuestionInput["type"];
                      updateQuestion(questionIndex, (current) =>
                        type === "free_text"
                          ? {
                              prompt: current.prompt,
                              type,
                              required: current.required,
                              options: [],
                            }
                          : {
                              prompt: current.prompt,
                              type,
                              required: current.required,
                              options:
                                current.options && current.options.length >= 2
                                  ? current.options
                                  : ["", ""],
                              ...(type === "multiple_choice"
                                ? { maxSelections: 2 }
                                : {}),
                            }
                      );
                    }}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-end gap-2 pb-2 text-sm text-primary">
                  <Checkbox
                    checked={question.required}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      updateQuestion(questionIndex, (current) => ({
                        ...current,
                        required: checked === true,
                      }))
                    }
                  />
                  Required
                </label>
              </div>
            )}

            {question.type !== "free_text" && (
              <div className="space-y-2">
                <Label>Options</Label>
                {(question.options ?? []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      maxLength={200}
                      disabled={disabled}
                      aria-label={`Option ${optionIndex + 1}`}
                      onChange={(event) =>
                        updateQuestion(questionIndex, (current) => ({
                          ...current,
                          options: (current.options ?? []).map(
                            (currentOption, index) =>
                              index === optionIndex
                                ? event.target.value
                                : currentOption
                          ),
                        }))
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    {(question.options?.length ?? 0) > 2 && (
                      <button
                        type="button"
                        aria-label={`Remove option ${optionIndex + 1}`}
                        disabled={disabled}
                        onClick={() =>
                          updateQuestion(questionIndex, (current) => {
                            const options = (current.options ?? []).filter(
                              (_, index) => index !== optionIndex
                            );
                            return {
                              ...current,
                              options,
                              ...(current.type === "multiple_choice" &&
                              current.maxSelections != null
                                ? {
                                    maxSelections: Math.min(
                                      current.maxSelections,
                                      options.length
                                    ),
                                  }
                                : {}),
                            };
                          })
                        }
                        className="rounded p-2 text-secondary hover:bg-wash hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {(question.options?.length ?? 0) < 10 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() =>
                      updateQuestion(questionIndex, (current) => ({
                        ...current,
                        options: [...(current.options ?? []), ""],
                      }))
                    }
                    className="px-0 text-secondary"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add option
                  </Button>
                )}
              </div>
            )}

            {question.type === "multiple_choice" && (
              <div className="max-w-xs">
                <Label htmlFor={`survey-max-${questionIndex}`}>
                  Maximum selections
                </Label>
                <Input
                  id={`survey-max-${questionIndex}`}
                  type="number"
                  min={1}
                  max={question.options?.length ?? 1}
                  value={question.maxSelections ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateQuestion(questionIndex, (current) => ({
                      ...current,
                      maxSelections: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    }))
                  }
                  className="mt-2"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {value.kind === "survey" && value.questions.length < 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onChange({
              ...value,
              questions: [...value.questions, choiceQuestion("single_choice")],
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add question
        </Button>
      )}

      <div className="max-w-sm">
        <Label htmlFor="survey-deadline">Deadline (optional)</Label>
        <Input
          id="survey-deadline"
          type="datetime-local"
          min={minDeadline}
          value={localDateTimeValue(value.closesAt)}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              closesAt: event.target.value
                ? new Date(event.target.value)
                : undefined,
            })
          }
          className="mt-2"
        />
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 text-xs text-red-600" aria-live="polite">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
