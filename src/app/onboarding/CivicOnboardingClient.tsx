"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  fetchDelegateStatement,
  submitDelegateStatement,
} from "@/app/delegates/actions";
import type { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
import type { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import {
  getForumSurveyByKey,
  submitForumSurveyResponse,
} from "@/lib/actions/forum/surveys";
import type { ForumSurveyDto } from "@/lib/actions/forum/surveyTypes";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useSiweJwt } from "@/hooks/useSiweJwt";
import {
  CIVIC_FEATURED_SURVEY_DESCRIPTION,
  CIVIC_FEATURED_SURVEY_OPTIONS,
  CIVIC_FEATURED_SURVEY_TITLE,
  CIVIC_INVOLVEMENT_LEVELS,
  CIVIC_SURVEY_KEYS,
  type CivicInvolvementLevelId,
} from "@/lib/civicSurveyConstants";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";

type LoadState =
  | { kind: "idle" | "loading" }
  | {
      kind: "ready";
      featured: ForumSurveyDto;
      existingUsername: string | null;
    }
  | { kind: "not-member" }
  | { kind: "error"; message: string };

type Step = "poll" | "profile" | "done";

const CIVIC_CLAIM_URL = "/claim";
const { slug: daoSlug } = Tenant.current();

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getActionError(result: unknown): { code: string; message: string } {
  const record = asRecord(result);
  return {
    code: typeof record.code === "string" ? record.code.toUpperCase() : "ERROR",
    message:
      typeof record.error === "string"
        ? record.error
        : "We couldn’t check your Supporter Pass. Please try again.",
  };
}

function isExpectedFeaturedSurvey(survey: ForumSurveyDto): boolean {
  const question = survey.questions[0];
  return (
    survey.key === CIVIC_SURVEY_KEYS.featuredBriefing &&
    survey.kind === "poll" &&
    question?.type === "single_choice" &&
    CIVIC_FEATURED_SURVEY_OPTIONS.every((label) =>
      question.options.some((option) => option.label === label)
    )
  );
}

function buildDelegateStatementValues(
  existing: DelegateStatement | null,
  username: string
): DelegateStatementFormValues {
  const payload = (existing?.payload ?? {}) as {
    delegateStatement?: string;
    topIssues?: { type: string; value: string }[];
    topStakeholders?: { type: string; value: string }[];
    openToSponsoringProposals?: "yes" | "no" | null;
    mostValuableProposals?: { number: string }[];
    leastValuableProposals?: { number: string }[];
  };

  return {
    agreeCodeConduct: true,
    agreeDaoPrinciples: true,
    daoSlug,
    discord: existing?.discord || "",
    username,
    avatar: existing?.avatar || "",
    delegateStatement: payload.delegateStatement || "",
    twitter: existing?.twitter || "",
    warpcast: existing?.warpcast || "",
    scwAddress: existing?.scw_address || "",
    topIssues: payload.topIssues ?? [],
    topStakeholders: payload.topStakeholders ?? [],
    openToSponsoringProposals: payload.openToSponsoringProposals ?? null,
    mostValuableProposals: payload.mostValuableProposals ?? [],
    leastValuableProposals: payload.leastValuableProposals ?? [],
  };
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl pb-20 pt-8 sm:pt-12">
      {children}
    </main>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <PageFrame>
      <div
        className="flex min-h-[22rem] flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-neutral px-6 text-center shadow-sm"
        aria-live="polite"
      >
        <LoadingSpinner className="h-7 w-7 text-brandPrimary" />
        <p className="text-secondary">{message}</p>
      </div>
    </PageFrame>
  );
}

async function authedFetchJson(
  jwt: string,
  url: string,
  init: Omit<RequestInit, "body"> & { json?: unknown } = {}
): Promise<unknown> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${jwt}`);
  const body = init.json === undefined ? undefined : JSON.stringify(init.json);
  if (body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      typeof (payload as { error?: unknown }).error === "string"
        ? (payload as { error: string }).error
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return payload;
}

export default function CivicOnboardingClient() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken, user } = usePrivy();
  const { address: wagmiAddress, isConnected } = useAccount();
  const { openConnectModal, isConnecting } = useConnectModal();
  const [loadState, setLoadState] = useState<LoadState>({ kind: "idle" });
  const [reloadKey, setReloadKey] = useState(0);
  const [step, setStep] = useState<Step>("poll");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [involvement, setInvolvement] =
    useState<CivicInvolvementLevelId>("occasional");
  const [email, setEmail] = useState("");
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const memberAddress =
    loadState.kind === "ready" ? loadState.featured.viewer.address : null;
  const { ensureSession: ensureSiweSession, isSigningIn } = useSiweJwt({
    expectedAddress: memberAddress ?? undefined,
    autoAuthenticate: false,
    purpose: "delegate_statement",
  });

  const privyEmail =
    typeof user?.email?.address === "string" ? user.email.address : "";

  const loadSurvey = useCallback(async () => {
    setLoadState({ kind: "loading" });
    setFormError(null);

    try {
      const privyAccessToken = await getAccessToken();
      if (!privyAccessToken) {
        setLoadState({
          kind: "error",
          message: "Please sign in again.",
        });
        return;
      }

      const featuredResult = await getForumSurveyByKey(
        CIVIC_SURVEY_KEYS.featuredBriefing,
        { privyAccessToken }
      );

      if (!featuredResult.success) {
        const error = getActionError(featuredResult);
        if (error.code === "NOT_MEMBER") {
          setLoadState({ kind: "not-member" });
        } else {
          setLoadState({ kind: "error", message: error.message });
        }
        return;
      }

      const featured = featuredResult.data;
      if (!isExpectedFeaturedSurvey(featured)) {
        setLoadState({
          kind: "error",
          message: "This page isn’t ready yet. Please try again soon.",
        });
        return;
      }

      if (featured.viewer.code === "VERIFICATION_FAILED") {
        setLoadState({
          kind: "error",
          message:
            featured.viewer.error ??
            "We couldn’t check your Supporter Pass. Please try again.",
        });
        return;
      }
      if (featured.viewer.code === "UNAUTHENTICATED") {
        setLoadState({
          kind: "error",
          message: featured.viewer.error ?? "Please sign in again.",
        });
        return;
      }
      if (!featured.viewer.isMember) {
        setLoadState({ kind: "not-member" });
        return;
      }
      if (!featured.viewer.authenticated || !featured.viewer.address) {
        setLoadState({
          kind: "error",
          message: "Please sign in again.",
        });
        return;
      }
      if (!featured.viewer.hasResponded && !featured.viewer.canRespond) {
        setLoadState({
          kind: "error",
          message: "This poll is closed right now.",
        });
        return;
      }

      let existingUsername: string | null = null;
      try {
        const statement = await fetchDelegateStatement(featured.viewer.address);
        existingUsername = statement?.username?.trim() || null;
        if (existingUsername) setDisplayName(existingUsername);
      } catch {
        existingUsername = null;
      }

      if (privyEmail) {
        setEmail((current) => current || privyEmail);
      }

      const answeredOptionId =
        featured.viewer.response?.answers?.[0]?.optionIds?.[0] ?? null;
      setSelectedOptionId(answeredOptionId);

      if (featured.viewer.hasResponded && existingUsername) {
        setStep("done");
      } else if (featured.viewer.hasResponded) {
        setStep("profile");
      } else {
        setStep("poll");
      }

      setLoadState({ kind: "ready", featured, existingUsername });
    } catch (error) {
      console.error("Failed to load CIVIC onboarding", error);
      setLoadState({
        kind: "error",
        message: "We couldn’t check your Supporter Pass. Please try again.",
      });
    }
  }, [getAccessToken, privyEmail]);

  useEffect(() => {
    if (!ready || !authenticated) return;
    void loadSurvey();
  }, [ready, authenticated, reloadKey, loadSurvey]);

  useEffect(() => {
    if (privyEmail && !email) {
      setEmail(privyEmail);
    }
  }, [email, privyEmail]);

  const question = useMemo(() => {
    if (loadState.kind !== "ready") return null;
    return loadState.featured.questions[0] ?? null;
  }, [loadState]);

  const goToCommunity = useCallback(() => {
    router.push("/forums");
  }, [router]);

  const submitPoll = async () => {
    if (loadState.kind !== "ready" || !question || selectedOptionId == null) {
      setFormError("Choose one topic to continue.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const privyAccessToken = await getAccessToken();
      if (!privyAccessToken) {
        setFormError("Your session expired. Please sign in again.");
        return;
      }

      if (!loadState.featured.viewer.hasResponded) {
        const result = await submitForumSurveyResponse({
          surveyId: loadState.featured.id,
          privyAccessToken,
          answers: [
            {
              questionId: question.id,
              optionIds: [selectedOptionId],
            },
          ],
        });

        if (!result.success) {
          setFormError(getActionError(result).message);
          return;
        }
      }

      setStep("profile");
    } catch (error) {
      console.error("Failed to submit CIVIC briefing poll", error);
      setFormError("We couldn’t save that. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipPoll = () => {
    setFormError(null);
    setStep("profile");
  };

  const finishProfile = async () => {
    if (loadState.kind !== "ready" || !memberAddress) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setFormError("Enter a display name so others know who you are.");
      return;
    }
    if (trimmedName.length > 40) {
      setFormError("Display names must be 40 characters or fewer.");
      return;
    }

    const trimmedEmail = email.trim();
    if (enableNotifications && !trimmedEmail) {
      setFormError(
        "Add an email address to get updates, or turn notifications off."
      );
      return;
    }
    if (
      enableNotifications &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (!isConnected || wagmiAddress?.toLowerCase() !== memberAddress) {
      setFormError(
        "Connect the account that holds your Supporter Pass to finish setup."
      );
      openConnectModal();
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const jwt = await ensureSiweSession();
      if (!jwt) {
        setFormError(
          "Please confirm the sign-in request to save your profile."
        );
        return;
      }

      let existing: DelegateStatement | null = null;
      try {
        existing = (await fetchDelegateStatement(
          memberAddress
        )) as DelegateStatement | null;
      } catch {
        existing = null;
      }

      await submitDelegateStatement({
        address: memberAddress as `0x${string}`,
        delegateStatement: buildDelegateStatementValues(existing, trimmedName),
        scwAddress: existing?.scw_address || undefined,
        auth: { kind: "siwe_jwt", jwt },
      });

      if (enableNotifications && trimmedEmail) {
        await authedFetchJson(
          jwt,
          "/api/v1/notification-preferences/channels/email",
          {
            method: "POST",
            json: { email: trimmedEmail },
          }
        );

        try {
          await authedFetchJson(
            jwt,
            "/api/v1/notification-preferences/email/verify/initiate",
            { method: "POST" }
          );
        } catch {
          // Verification email is best-effort; prefs still apply.
        }

        const settings = (await authedFetchJson(
          jwt,
          "/api/v1/notification-preferences"
        )) as {
          eventTypes?: Array<{ event_type: string; enabled?: boolean }>;
        };

        const level = CIVIC_INVOLVEMENT_LEVELS.find(
          (candidate) => candidate.id === involvement
        );
        const enabledTypes = new Set(
          (settings.eventTypes ?? [])
            .filter((eventType) => eventType.enabled !== false)
            .map((eventType) => eventType.event_type)
        );

        for (const eventType of level?.eventTypes ?? []) {
          if (!enabledTypes.has(eventType)) continue;
          await authedFetchJson(
            jwt,
            "/api/v1/notification-preferences/preferences/set",
            {
              method: "POST",
              json: {
                eventType,
                channel: "email",
                state: "on",
              },
            }
          );
        }
      }

      setStep("done");
    } catch (error) {
      console.error("Failed to finish CIVIC onboarding profile", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn’t save your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return <LoadingState message="Just a moment…" />;
  }

  if (!authenticated) {
    return (
      <PageFrame>
        <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandPrimary">
            Welcome to CIVIC
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            Sign in to join the CIVIC community
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
            Use the same email or account you used when you claimed your free
            Supporter Pass.
          </p>
          <Button
            className="mt-8 bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
            onClick={openConnectModal}
            disabled={isConnecting}
            loading={isConnecting}
          >
            Continue
          </Button>
        </div>
      </PageFrame>
    );
  }

  if (loadState.kind === "idle" || loadState.kind === "loading") {
    return <LoadingState message="Checking your Supporter Pass…" />;
  }

  if (loadState.kind === "not-member") {
    return (
      <PageFrame>
        <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandPrimary">
            Supporter Pass required
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary">
            We couldn’t find your Supporter Pass
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-secondary">
            If you just claimed it, wait a moment and try again. Otherwise,
            claim a free Supporter Pass to continue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              className="bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Try again
            </Button>
            <Button asChild variant="elevatedOutline">
              <a
                href={CIVIC_CLAIM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Claim a free Supporter Pass
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </PageFrame>
    );
  }

  if (loadState.kind === "error") {
    return (
      <PageFrame>
        <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-primary">
            Something went wrong
          </h1>
          <p className="mt-4 leading-7 text-secondary">{loadState.message}</p>
          <Button
            className="mt-8 bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Try again
          </Button>
        </div>
      </PageFrame>
    );
  }

  if (step === "done") {
    const selectedLabel =
      question?.options.find((option) => option.id === selectedOptionId)
        ?.label ?? null;

    return (
      <PageFrame>
        <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-positive/15 text-positive">
            <Check className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brandPrimary">
            Welcome
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">You’re in</h1>
          <p className="mt-4 leading-7 text-secondary">
            {selectedLabel
              ? "Thanks — your vote is public. Here’s what you chose."
              : "Your profile is ready. Head to the community to get started."}
          </p>
          {selectedLabel ? (
            <div className="mt-8 rounded-xl border border-line bg-wash px-4 py-3 text-sm font-medium text-primary">
              {selectedLabel}
            </div>
          ) : null}
          <Button
            className="mt-8 bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
            onClick={goToCommunity}
          >
            Go to the community
          </Button>
        </div>
      </PageFrame>
    );
  }

  if (step === "profile") {
    return (
      <PageFrame>
        <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandPrimary">
            Almost done
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            How should we show you in the community?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
            CIVIC is a community of people, not wallets. Choose a name others
            will recognize.
          </p>

          <div className="mt-10 space-y-8">
            <div>
              <Label htmlFor="civic-display-name">Display name</Label>
              <Input
                id="civic-display-name"
                value={displayName}
                maxLength={40}
                placeholder="Your name or initials"
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setFormError(null);
                }}
                className="mt-2"
              />
              <p className="mt-2 text-sm text-tertiary">
                This is how other supporters will see you on posts and polls.
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-primary">
                How involved do you want to be?
              </legend>
              <p className="mt-1 text-sm text-tertiary">
                This chooses which emails you’ll get from CIVIC. You can change
                it anytime in notification settings.
              </p>
              <div className="mt-3 space-y-3">
                {CIVIC_INVOLVEMENT_LEVELS.map((level) => {
                  const checked = involvement === level.id;
                  return (
                    <label
                      key={level.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                        checked
                          ? "border-brandPrimary bg-brandPrimary/5"
                          : "border-line bg-neutral hover:bg-wash"
                      )}
                    >
                      <input
                        type="radio"
                        name="civic-involvement"
                        className="mt-1 h-4 w-4 accent-[rgb(var(--brand-primary))] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                        checked={checked}
                        onChange={() => setInvolvement(level.id)}
                      />
                      <span>
                        <span className="block text-sm font-medium text-primary">
                          {level.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-secondary">
                          {level.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="civic-email">Email for updates</Label>
              <Input
                id="civic-email"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFormError(null);
                }}
                className="mt-2"
              />
              <label className="mt-3 flex items-start gap-3 text-sm text-primary">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-line accent-[rgb(var(--brand-primary))]"
                  checked={enableNotifications}
                  onChange={(event) =>
                    setEnableNotifications(event.target.checked)
                  }
                />
                <span>
                  Send me emails for the level I chose above. You can change
                  this anytime in notification settings.
                </span>
              </label>
            </div>
          </div>

          {formError ? (
            <p className="mt-6 text-sm font-medium text-negative" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
                onClick={() => void finishProfile()}
                disabled={isSubmitting || isSigningIn}
                loading={isSubmitting || isSigningIn}
              >
                Finish setup
              </Button>
              <Button
                variant="ghost"
                onClick={goToCommunity}
                disabled={isSubmitting || isSigningIn}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className="rounded-2xl border border-line bg-neutral p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandPrimary">
          Welcome to CIVIC
        </p>
        <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
          {CIVIC_FEATURED_SURVEY_TITLE}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
          One question to get started. Then we’ll set up how you appear in the
          community.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-tertiary">
          {CIVIC_FEATURED_SURVEY_DESCRIPTION}
        </p>

        {question ? (
          <fieldset className="mt-10">
            <legend className="sr-only">{question.prompt}</legend>
            <div className="grid gap-3">
              {question.options.map((option) => {
                const checked = selectedOptionId === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                      checked
                        ? "border-brandPrimary bg-brandPrimary/5"
                        : "border-line bg-neutral hover:bg-wash"
                    )}
                  >
                    <input
                      type="radio"
                      name="civic-featured-topic"
                      className="h-4 w-4 accent-[rgb(var(--brand-primary))] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                      checked={checked}
                      onChange={() => {
                        setSelectedOptionId(option.id);
                        setFormError(null);
                      }}
                    />
                    <span className="text-sm font-medium text-primary">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {formError ? (
          <p className="mt-6 text-sm font-medium text-negative" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button
            className="bg-brandPrimary text-neutral hover:bg-brandPrimary/90"
            onClick={() => void submitPoll()}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Continue
          </Button>
          <Button variant="ghost" onClick={skipPoll} disabled={isSubmitting}>
            Skip for now
          </Button>
        </div>
      </div>
    </PageFrame>
  );
}
