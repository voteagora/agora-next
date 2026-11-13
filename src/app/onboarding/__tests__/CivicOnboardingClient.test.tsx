import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import {
  fetchDelegateStatement,
  submitDelegateStatement,
} from "@/app/delegates/actions";
import {
  getForumSurveyByKey,
  submitForumSurveyResponse,
} from "@/lib/actions/forum/surveys";
import {
  CIVIC_FEATURED_SURVEY_OPTIONS,
  CIVIC_FEATURED_SURVEY_TITLE,
} from "@/lib/civicSurveyConstants";
import { useSiweJwt } from "@/hooks/useSiweJwt";
import CivicOnboardingClient from "../CivicOnboardingClient";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
}));

vi.mock("@/components/providers/ConnectModalContext", () => ({
  useConnectModal: vi.fn(),
}));

vi.mock("@/lib/actions/forum/surveys", () => ({
  getForumSurveyByKey: vi.fn(),
  submitForumSurveyResponse: vi.fn(),
}));

vi.mock("@/app/delegates/actions", () => ({
  fetchDelegateStatement: vi.fn(),
  submitDelegateStatement: vi.fn(),
}));

vi.mock("@/hooks/useSiweJwt", () => ({
  useSiweJwt: vi.fn(),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({ slug: "CIVIC" }),
  },
}));

const getAccessToken = vi.fn();
const openConnectModal = vi.fn();
const push = vi.fn();
const ensureSession = vi.fn();
const MEMBER_ADDRESS = "0x1111111111111111111111111111111111111111";

function createFeaturedSurvey({
  isMember = true,
  hasResponded = false,
}: {
  isMember?: boolean;
  hasResponded?: boolean;
} = {}) {
  return {
    id: 2,
    topicId: 72,
    title: CIVIC_FEATURED_SURVEY_TITLE,
    description: "Pick one.",
    key: "civic-featured-briefing",
    kind: "poll",
    closesAt: null,
    closedAt: null,
    status: "open",
    isOpen: true,
    responseCount: hasResponded ? 1 : 0,
    canViewResults: hasResponded,
    questions: [
      {
        id: 10,
        prompt: "Choose one topic",
        type: "single_choice",
        required: true,
        maxSelections: null,
        position: 0,
        options: CIVIC_FEATURED_SURVEY_OPTIONS.map((label, index) => ({
          id: 201 + index,
          label,
          position: index,
          order: index,
          responseCount: hasResponded && index === 0 ? 1 : 0,
        })),
      },
    ],
    viewer: {
      authenticated: true,
      isMember,
      canRespond: isMember && !hasResponded,
      hasResponded,
      address: isMember ? MEMBER_ADDRESS : null,
      response: hasResponded
        ? {
            answers: [{ questionId: 10, optionIds: [201], text: null }],
          }
        : null,
    },
    viewerResponse: null,
  };
}

function mockSuccessfulLoad(featured = createFeaturedSurvey()) {
  vi.mocked(getForumSurveyByKey).mockResolvedValue({
    success: true,
    data: featured,
  } as never);
  vi.mocked(fetchDelegateStatement).mockResolvedValue(
    featured.viewer.hasResponded
      ? ({ username: "Alex" } as never)
      : (null as never)
  );
}

function renderClient() {
  return render(<CivicOnboardingClient />);
}

describe("CivicOnboardingClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAccessToken.mockResolvedValue("privy-token");
    ensureSession.mockResolvedValue("siwe-jwt");
    vi.mocked(usePrivy).mockReturnValue({
      ready: true,
      authenticated: true,
      getAccessToken,
      user: { email: { address: "alex@example.com" } },
    } as unknown as ReturnType<typeof usePrivy>);
    vi.mocked(useRouter).mockReturnValue({ push } as never);
    vi.mocked(useAccount).mockReturnValue({
      address: MEMBER_ADDRESS,
      isConnected: true,
    } as never);
    vi.mocked(useConnectModal).mockReturnValue({
      openConnectModal,
      isOpen: false,
      isConnecting: false,
      disconnect: vi.fn(),
    });
    vi.mocked(useSiweJwt).mockReturnValue({
      ensureSession,
      isSigningIn: false,
    } as never);
    vi.mocked(submitForumSurveyResponse).mockResolvedValue({
      success: true,
      data: { surveyId: 2, topicId: 72, responseId: 9 },
    } as never);
    vi.mocked(submitDelegateStatement).mockResolvedValue({} as never);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        eventTypes: [
          { event_type: "proposal_published", enabled: true },
          {
            event_type: "forum_discussion_in_watched_category",
            enabled: true,
          },
        ],
      }),
    }) as never;
  });

  afterEach(() => cleanup());

  it("asks an unauthenticated supporter to sign in", () => {
    vi.mocked(usePrivy).mockReturnValue({
      ready: true,
      authenticated: false,
      getAccessToken,
      user: null,
    } as unknown as ReturnType<typeof usePrivy>);

    renderClient();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(openConnectModal).toHaveBeenCalledOnce();
    expect(getForumSurveyByKey).not.toHaveBeenCalled();
  });

  it("renders the featured briefing poll options", async () => {
    mockSuccessfulLoad(createFeaturedSurvey());
    renderClient();

    expect(
      await screen.findByRole("heading", {
        name: CIVIC_FEATURED_SURVEY_TITLE,
      })
    ).toBeInTheDocument();

    for (const option of CIVIC_FEATURED_SURVEY_OPTIONS) {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
    }
  });

  it("requires a topic before continuing", async () => {
    mockSuccessfulLoad(createFeaturedSurvey());
    renderClient();

    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose one topic to continue."
    );
    expect(submitForumSurveyResponse).not.toHaveBeenCalled();
  });

  it("submits the poll and moves to profile setup", async () => {
    mockSuccessfulLoad(createFeaturedSurvey());
    renderClient();

    fireEvent.click(
      await screen.findByLabelText("Preventing harm to civilians")
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(submitForumSurveyResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          surveyId: 2,
          privyAccessToken: "privy-token",
          answers: [{ questionId: 10, optionIds: [201] }],
        })
      )
    );

    expect(
      await screen.findByRole("heading", {
        name: "How should we show you in the community?",
      })
    ).toBeInTheDocument();
  });

  it("skips the poll and still opens profile setup", async () => {
    mockSuccessfulLoad(createFeaturedSurvey());
    renderClient();

    fireEvent.click(
      await screen.findByRole("button", { name: "Skip for now" })
    );

    expect(submitForumSurveyResponse).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("heading", {
        name: "How should we show you in the community?",
      })
    ).toBeInTheDocument();
  });

  it("shows retry and the claim CTA when no pass is found", async () => {
    mockSuccessfulLoad(createFeaturedSurvey({ isMember: false }));
    renderClient();

    expect(
      await screen.findByRole("heading", {
        name: "We couldn’t find your Supporter Pass",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Claim a free Supporter Pass/ })
    ).toHaveAttribute("href", "/claim");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(getForumSurveyByKey).toHaveBeenCalledTimes(2));
  });

  it("shows the done state for returning members with a display name", async () => {
    mockSuccessfulLoad(createFeaturedSurvey({ hasResponded: true }));
    renderClient();

    expect(
      await screen.findByRole("heading", { name: "You’re in" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Preventing harm to civilians")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Go to the community" })
    );
    expect(push).toHaveBeenCalledWith("/forums");
  });

  it("saves display name and notification defaults from profile setup", async () => {
    mockSuccessfulLoad(createFeaturedSurvey());
    renderClient();

    fireEvent.click(
      await screen.findByLabelText("Preventing harm to civilians")
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const nameInput = await screen.findByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Alex Rivera" } });
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }));

    await waitFor(() =>
      expect(submitDelegateStatement).toHaveBeenCalledWith(
        expect.objectContaining({
          address: MEMBER_ADDRESS,
          auth: { kind: "siwe_jwt", jwt: "siwe-jwt" },
          delegateStatement: expect.objectContaining({
            username: "Alex Rivera",
          }),
        })
      )
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/notification-preferences/channels/email",
      expect.objectContaining({ method: "POST" })
    );
    expect(
      await screen.findByRole("heading", { name: "You’re in" })
    ).toBeInTheDocument();
  });
});
