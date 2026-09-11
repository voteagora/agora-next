"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { BarChart3, CheckCircle2, Clock3, Loader2, Lock } from "lucide-react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import ForumAuthorName from "@/components/Forum/ForumAuthorName";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  closeForumSurvey,
  getForumSurveyByTopic,
  submitForumSurvey,
  type ForumSurveyDto,
  type SurveySubmissionInput,
} from "@/lib/actions/forum/surveys";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

interface ForumSurveyProps {
  topicId: number;
  initialSurvey: ForumSurveyDto;
  topicAuthor: string;
  adminDirectory?: Array<{ address: string; role?: string | null }>;
  variant?: "topic" | "onboarding";
  onComplete?: (survey: ForumSurveyDto) => void;
}

type DraftAnswer = {
  optionIds: number[];
  text: string;
};

type DraftAnswers = Record<number, DraftAnswer>;

const RESPONSES_PER_PAGE = 8;

function resultError(result: unknown, fallback: string): string {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }
  return fallback;
}

function formatDeadline(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function emptyAnswers(survey: ForumSurveyDto): DraftAnswers {
  return Object.fromEntries(
    survey.questions.map((question) => [
      question.id,
      { optionIds: [], text: "" },
    ])
  );
}

function responseAnswers(
  survey: ForumSurveyDto,
  response: NonNullable<ForumSurveyDto["viewerResponse"]>
): DraftAnswers {
  const answers = emptyAnswers(survey);
  response.answers.forEach((answer) => {
    answers[answer.questionId] = {
      optionIds: answer.optionIds ?? [],
      text: answer.text ?? "",
    };
  });
  return answers;
}

function validateAnswers(
  survey: ForumSurveyDto,
  answers: DraftAnswers
): string | null {
  let hasAnswer = false;
  for (const question of survey.questions) {
    const answer = answers[question.id] ?? { optionIds: [], text: "" };
    const answered =
      question.type === "free_text"
        ? Boolean(answer.text.trim())
        : answer.optionIds.length > 0;
    hasAnswer ||= answered;

    if (question.required && !answered) {
      return `Please answer “${question.prompt}”.`;
    }
    if (question.type === "single_choice" && answer.optionIds.length > 1) {
      return `Choose one option for “${question.prompt}”.`;
    }
    if (
      question.type === "multiple_choice" &&
      question.maxSelections != null &&
      answer.optionIds.length > question.maxSelections
    ) {
      return `Choose no more than ${question.maxSelections} options for “${question.prompt}”.`;
    }
    if (question.type === "free_text" && answer.text.trim().length > 2_000) {
      return `Your answer to “${question.prompt}” is longer than 2,000 characters.`;
    }
  }
  return hasAnswer ? null : "Answer at least one question.";
}

function buildSubmissionAnswers(
  survey: ForumSurveyDto,
  answers: DraftAnswers
): SurveySubmissionInput["answers"] {
  const submissionAnswers: SurveySubmissionInput["answers"] = [];

  survey.questions.forEach((question) => {
    const answer = answers[question.id] ?? { optionIds: [], text: "" };
    if (question.type === "free_text") {
      const text = answer.text.trim();
      if (text) submissionAnswers.push({ questionId: question.id, text });
      return;
    }
    if (answer.optionIds.length > 0) {
      submissionAnswers.push({
        questionId: question.id,
        optionIds: answer.optionIds,
      });
    }
  });

  return submissionAnswers;
}

function AnswerSummary({
  survey,
  answers,
}: {
  survey: ForumSurveyDto;
  answers: DraftAnswers;
}) {
  return (
    <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
      {survey.questions.map((question) => {
        const answer = answers[question.id] ?? { optionIds: [], text: "" };
        const selectedLabels = question.options
          .filter((option) => answer.optionIds.includes(option.id))
          .map((option) => option.label);
        const display =
          question.type === "free_text"
            ? answer.text.trim()
            : selectedLabels.join(", ");

        return (
          <div key={question.id}>
            <p className="text-xs font-semibold text-secondary">
              {question.prompt}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
              {display || "No answer"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SurveyResults({
  survey,
  page,
  loading,
  onPageChange,
}: {
  survey: ForumSurveyDto;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const responses = survey.responses ?? [];
  const pageCount = Math.max(
    1,
    Math.ceil(survey.responseCount / RESPONSES_PER_PAGE)
  );

  useEffect(() => {
    if (page >= pageCount) onPageChange(pageCount - 1);
  }, [onPageChange, page, pageCount]);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {survey.questions.map((question) => (
          <div key={question.id}>
            <p className="text-sm font-semibold text-primary">
              {question.prompt}
            </p>
            {question.type === "free_text" ? (
              <p className="mt-1 text-xs text-secondary">
                Written answers are shown with each respondent below.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {question.options.map((option) => {
                  const count = option.responseCount ?? 0;
                  const percent =
                    survey.responseCount > 0
                      ? Math.round((count / survey.responseCount) * 100)
                      : 0;
                  return (
                    <div key={option.id}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-primary">
                          {option.label}
                        </span>
                        <span className="shrink-0 text-secondary">
                          {count} · {percent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-brandPrimary transition-[width]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {responses.length > 0 && (
        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-primary">
            Public responses
          </h3>
          <div className="mt-3 space-y-3">
            {responses.map((response) => (
              <article
                key={response.id}
                className="rounded-lg border border-line bg-wash p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">
                    <ForumAuthorName
                      address={response.address}
                      displayName={response.displayName}
                      isDeleted={response.isDeleted}
                    />
                  </p>
                  <time className="text-xs text-tertiary">
                    {formatDeadline(response.createdAt)}
                  </time>
                </div>
                <div className="mt-3 space-y-3">
                  {response.answers.map((answer) => {
                    const question = survey.questions.find(
                      (candidate) => candidate.id === answer.questionId
                    );
                    if (!question) return null;
                    const selectedLabels = question.options
                      .filter((option) =>
                        (answer.optionIds ?? []).includes(option.id)
                      )
                      .map((option) => option.label);
                    return (
                      <div key={question.id}>
                        <p className="text-xs font-semibold text-secondary">
                          {question.prompt}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
                          {answer.text || selectedLabels.join(", ") || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0 || loading}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-secondary">
                Page {page + 1} of {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pageCount - 1 || loading}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ForumSurvey({
  topicId,
  initialSurvey,
  topicAuthor,
  adminDirectory = [],
  variant = "topic",
  onComplete,
}: ForumSurveyProps) {
  const { address } = useAccount();
  const { authenticated, ready, getAccessToken, login } = usePrivy();
  const { getAuthenticationData } = useProposalActionAuth();
  const normalizedAddress = address?.toLowerCase();
  const isLocalStaffViewer = Boolean(
    normalizedAddress &&
      (normalizedAddress === topicAuthor.toLowerCase() ||
        adminDirectory.some(
          (admin) => admin.address.toLowerCase() === normalizedAddress
        ))
  );
  const staffJwtRef = useRef<string | null>(null);
  const [survey, setSurvey] = useState(initialSurvey);
  const [answers, setAnswers] = useState<DraftAnswers>(() =>
    emptyAnswers(initialSurvey)
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responsePage, setResponsePage] = useState(0);

  const refresh = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const staffJwt = staffJwtRef.current;
        const privyAccessToken =
          !staffJwt && authenticated ? await getAccessToken() : null;
        const result = await getForumSurveyByTopic(topicId, {
          address,
          privyAccessToken: privyAccessToken ?? undefined,
          jwt: staffJwt ?? undefined,
          responseLimit: RESPONSES_PER_PAGE,
          responseOffset: page * RESPONSES_PER_PAGE,
        });
        if (!result.success) {
          throw new Error(resultError(result, "We couldn’t load this poll."));
        }
        if (result.data) {
          setSurvey(result.data);
          setResponsePage(page);
        }
        setError(null);
        return result.data ?? null;
      } catch (refreshError) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "We couldn’t load this poll."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, authenticated, getAccessToken, topicId]
  );

  useEffect(() => {
    if (!ready) return;
    void refresh(0);
  }, [ready, refresh]);

  const isOpen = survey.status === "open";
  const canClose = isOpen && isLocalStaffViewer;

  const deadline = formatDeadline(survey.closesAt);

  const validationError = useMemo(
    () => validateAnswers(survey, answers),
    [answers, survey]
  );
  const membershipBlocked =
    authenticated &&
    !loading &&
    !survey.viewer.canRespond &&
    !survey.viewer.hasResponded;

  const openConfirmation = async () => {
    if (!ready) return;
    if (!authenticated) {
      login();
      return;
    }
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setConfirmationOpen(true);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const privyAccessToken = await getAccessToken();
      if (!privyAccessToken) {
        throw new Error("Please sign in again to submit.");
      }
      const result = await submitForumSurvey({
        surveyId: survey.id,
        answers: buildSubmissionAnswers(survey, answers),
        privyAccessToken,
      });
      if (!result.success) {
        throw new Error(
          resultError(result, "We couldn’t submit that. Please try again.")
        );
      }
      setConfirmationOpen(false);
      toast.success("Thanks — your response is in.");
      const updatedSurvey = await refresh(0);
      onComplete?.(updatedSurvey ?? survey);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "We couldn’t submit that. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeSurvey = async () => {
    if (!address) return;
    setClosing(true);
    try {
      const auth = await getAuthenticationData({
        action: "closeForumSurvey",
        address,
        timestamp: new Date().toISOString(),
      });
      if (!auth) {
        throw new Error("Sign in to close this poll.");
      }
      const result = await closeForumSurvey({
        surveyId: survey.id,
        address,
        jwt: auth.jwt,
      });
      if (!result.success) {
        throw new Error(resultError(result, "We couldn’t close this poll."));
      }
      setCloseConfirmationOpen(false);
      toast.success("Poll closed. Results are now public.");
      await refresh(0);
    } catch (closeError) {
      const message =
        closeError instanceof Error
          ? closeError.message
          : "We couldn’t close this poll.";
      setError(message);
      toast.error(message);
    } finally {
      setClosing(false);
    }
  };

  const authenticateStaffViewer = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const auth = await getAuthenticationData({
        action: "viewForumSurveyResults",
        address,
        timestamp: new Date().toISOString(),
      });
      if (!auth) {
        throw new Error("Sign in to view results.");
      }
      staffJwtRef.current = auth.jwt;
      await refresh(0);
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "We couldn’t sign you in to view results.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-xl border border-line bg-cardBackground ${
        variant === "onboarding" ? "p-6 sm:p-8" : "p-4 sm:p-6"
      }`}
      aria-labelledby={`forum-survey-${survey.id}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-wash px-2.5 py-1 text-xs font-semibold text-secondary">
              <BarChart3 className="h-3.5 w-3.5" />
              {survey.kind === "poll" ? "Poll" : "Survey"}
            </span>
            <span className="text-xs text-tertiary">
              {survey.kind === "poll"
                ? "One question · pick one"
                : `${survey.questions.length} question${survey.questions.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <h2
            id={`forum-survey-${survey.id}-title`}
            className="mt-3 text-lg font-semibold text-primary"
          >
            {survey.kind === "poll"
              ? (survey.questions[0]?.prompt ?? "Community poll")
              : "Community survey"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-primary">
            {survey.responseCount}{" "}
            {survey.kind === "poll"
              ? survey.responseCount === 1
                ? "vote"
                : "votes"
              : survey.responseCount === 1
                ? "response"
                : "responses"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-secondary">
            <span className="inline-flex items-center gap-1">
              {isOpen ? (
                <Clock3 className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {isOpen ? "Open" : "Closed"}
            </span>
            {deadline && isOpen && <span>Closes {deadline}</span>}
          </div>
        </div>

        {canClose && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCloseConfirmationOpen(true)}
          >
            {survey.kind === "poll" ? "Close poll" : "Close survey"}
          </Button>
        )}
      </div>

      {loading && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-secondary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {survey.viewerResponse ? (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-5 w-5 text-positive" />
            Thanks — your response is in
          </div>
          <p className="text-xs text-secondary">
            Responses are public and can’t be edited.
          </p>
          <div className="rounded-lg border border-line bg-wash p-4">
            <AnswerSummary
              survey={survey}
              answers={responseAnswers(survey, survey.viewerResponse)}
            />
          </div>
        </div>
      ) : isOpen && membershipBlocked ? (
        <div className="mt-6 rounded-lg border border-line bg-wash p-4">
          <p className="text-sm font-semibold text-primary">
            {survey.viewer.code === "UNAUTHENTICATED"
              ? "Please sign in to respond."
              : "You need a free CIVIC Supporter Pass to respond."}
          </p>
          <p className="mt-1 text-xs text-secondary">
            {survey.viewer.error ||
              "We couldn’t find a Supporter Pass on your account."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void refresh(0)}
            className="mt-3"
          >
            {loading ? "Checking…" : "Try again"}
          </Button>
        </div>
      ) : isOpen ? (
        <div className="mt-6 space-y-6">
          {survey.questions.map((question, questionIndex) => {
            const answer = answers[question.id] ?? {
              optionIds: [],
              text: "",
            };
            return (
              <fieldset key={question.id} className="space-y-3">
                <legend className="text-sm font-semibold text-primary">
                  {questionIndex + 1}. {question.prompt}
                  {question.required && (
                    <span className="ml-1 text-red-600" aria-label="required">
                      *
                    </span>
                  )}
                </legend>
                {question.type === "free_text" ? (
                  <div>
                    <textarea
                      value={answer.text}
                      maxLength={2_000}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: {
                            ...answer,
                            text: event.target.value,
                          },
                        }))
                      }
                      placeholder="Your answer"
                      className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <p className="mt-1 text-right text-xs text-tertiary">
                      {answer.text.length}/2,000
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {question.type === "multiple_choice" &&
                      question.maxSelections != null && (
                        <p className="text-xs text-secondary">
                          Choose up to {question.maxSelections}.
                        </p>
                      )}
                    {question.options.map((option) => {
                      const selected = answer.optionIds.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border border-line px-3 py-2.5 text-sm text-primary hover:bg-wash"
                        >
                          {question.type === "single_choice" ? (
                            <input
                              type="radio"
                              name={`survey-question-${question.id}`}
                              value={option.id}
                              checked={selected}
                              onChange={() =>
                                setAnswers((current) => ({
                                  ...current,
                                  [question.id]: {
                                    ...answer,
                                    optionIds: [option.id],
                                  },
                                }))
                              }
                              className="h-4 w-4 border-line text-brandPrimary focus:ring-brandPrimary"
                            />
                          ) : (
                            <Checkbox
                              checked={selected}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...answer.optionIds, option.id]
                                  : answer.optionIds.filter(
                                      (id) => id !== option.id
                                    );
                                if (
                                  checked &&
                                  question.maxSelections != null &&
                                  next.length > question.maxSelections
                                ) {
                                  setError(
                                    `Choose no more than ${question.maxSelections} options for “${question.prompt}”.`
                                  );
                                  return;
                                }
                                setError(null);
                                setAnswers((current) => ({
                                  ...current,
                                  [question.id]: {
                                    ...answer,
                                    optionIds: next,
                                  },
                                }));
                              }}
                            />
                          )}
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            );
          })}

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-xs text-secondary">
              Your response will be public and can’t be changed.
            </p>
            <Button type="button" disabled={loading} onClick={openConfirmation}>
              {loading
                ? "Checking your pass…"
                : authenticated
                  ? "Review response"
                  : "Sign in to respond"}
            </Button>
          </div>
        </div>
      ) : null}

      {survey.canViewResults ? (
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="mb-5 text-base font-semibold text-primary">Results</h3>
          <SurveyResults
            survey={survey}
            page={responsePage}
            loading={loading}
            onPageChange={(page) => void refresh(page)}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-md bg-wash px-3 py-2 text-xs text-secondary">
          Results are visible after you respond, or when the poll closes.
          Authors and moderators can always see them.
          {isLocalStaffViewer && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={authenticateStaffViewer}
              >
                {loading ? "Signing in…" : "Sign in to view results"}
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your response?</DialogTitle>
            <DialogDescription>
              This will be public and can’t be changed.
            </DialogDescription>
          </DialogHeader>
          <AnswerSummary survey={survey} answers={answers} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setConfirmationOpen(false)}
            >
              Go back
            </Button>
            <Button type="button" disabled={submitting} onClick={submit}>
              {submitting ? "Submitting…" : "Submit response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={closeConfirmationOpen}
        onOpenChange={setCloseConfirmationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {survey.kind === "poll"
                ? "Close this poll?"
                : "Close this survey?"}
            </DialogTitle>
            <DialogDescription>
              Closing can’t be undone. No new responses, and results become
              public.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={closing}
              onClick={() => setCloseConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={closing} onClick={closeSurvey}>
              {closing
                ? "Closing…"
                : survey.kind === "poll"
                  ? "Close poll"
                  : "Close survey"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
