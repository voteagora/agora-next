import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ForumSurveyDto } from "@/lib/actions/forum/surveyTypes";
import { ForumSurvey } from "./ForumSurvey";

const mocks = vi.hoisted(() => ({
  authenticated: false,
  ready: true,
  address: undefined as `0x${string}` | undefined,
  getAccessToken: vi.fn<() => Promise<string | null>>(),
  login: vi.fn(),
  getForumSurveyByTopic: vi.fn(),
  submitForumSurvey: vi.fn(),
  closeForumSurvey: vi.fn(),
  getAuthenticationData: vi.fn(),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: { current: () => ({}) },
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: mocks.authenticated,
    ready: mocks.ready,
    getAccessToken: mocks.getAccessToken,
    login: mocks.login,
  }),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mocks.address }),
}));

vi.mock("@/lib/actions/forum/surveys", () => ({
  getForumSurveyByTopic: mocks.getForumSurveyByTopic,
  submitForumSurvey: mocks.submitForumSurvey,
  closeForumSurvey: mocks.closeForumSurvey,
}));

vi.mock("@/hooks/useProposalActionAuth", () => ({
  useProposalActionAuth: () => ({
    getAuthenticationData: mocks.getAuthenticationData,
  }),
}));

vi.mock("@/components/Forum/ForumAuthorName", () => ({
  default: ({
    address,
    displayName,
    isDeleted,
  }: {
    address?: string | null;
    displayName?: string | null;
    isDeleted?: boolean;
  }) => (
    <span>
      {isDeleted ? "Removed account" : displayName || address || "Someone"}
    </span>
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const MEMBER_ADDRESS = "0x1111111111111111111111111111111111111111";

function makeSurvey(overrides: Partial<ForumSurveyDto> = {}): ForumSurveyDto {
  return {
    id: 7,
    topicId: 42,
    title: "A community question",
    description: null,
    key: null,
    kind: "poll",
    closesAt: null,
    closedAt: null,
    status: "open",
    isOpen: true,
    responseCount: 0,
    canViewResults: false,
    viewer: {
      authenticated: false,
      isMember: false,
      canRespond: false,
      hasResponded: false,
      response: null,
      address: null,
      code: "UNAUTHENTICATED",
      error: "Sign in to respond",
    },
    viewerResponse: null,
    questions: [
      {
        id: 11,
        prompt: "Which topic should CIVIC brief next?",
        type: "single_choice",
        required: true,
        maxSelections: null,
        position: 0,
        options: [
          {
            id: 101,
            label: "Harm prevention",
            position: 0,
            order: 0,
          },
          {
            id: 102,
            label: "Peacekeeping",
            position: 1,
            order: 1,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function makeResponses(offset: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: offset + index + 1,
    address: `0x${String(offset + index + 1).padStart(40, "0")}`,
    displayName: `Respondent ${offset + index + 1}`,
    isDeleted: false,
    createdAt: "2026-07-10T12:00:00.000Z",
    answers: [{ questionId: 11, optionIds: [101], text: null }],
  }));
}

describe("ForumSurvey", () => {
  beforeEach(() => {
    mocks.authenticated = false;
    mocks.ready = true;
    mocks.address = undefined;
    mocks.getAccessToken.mockResolvedValue(null);
    mocks.submitForumSurvey.mockResolvedValue({
      success: true,
      data: { surveyId: 7, topicId: 42, responseId: 1 },
    });
    mocks.closeForumSurvey.mockResolvedValue({
      success: true,
      data: {
        surveyId: 7,
        topicId: 42,
        closedAt: "2026-07-10T12:00:00.000Z",
      },
    });
    mocks.getAuthenticationData.mockResolvedValue({ jwt: "forum-jwt" });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("loads respondent pages from the server beyond the first page", async () => {
    const baseSurvey = makeSurvey({
      status: "closed",
      isOpen: false,
      closedAt: "2026-07-10T12:00:00.000Z",
      responseCount: 17,
      canViewResults: true,
      responses: makeResponses(0, 8),
    });
    mocks.getForumSurveyByTopic.mockImplementation(
      async (_topicId: number, viewer?: { responseOffset?: number }) => {
        const offset = viewer?.responseOffset ?? 0;
        const remaining = Math.max(0, 17 - offset);
        return {
          success: true,
          data: {
            ...baseSurvey,
            responses: makeResponses(offset, Math.min(8, remaining)),
          },
        };
      }
    );

    render(
      <ForumSurvey
        topicId={42}
        initialSurvey={baseSurvey}
        topicAuthor={MEMBER_ADDRESS}
      />
    );

    await waitFor(() =>
      expect(mocks.getForumSurveyByTopic).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ responseLimit: 8, responseOffset: 0 })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(mocks.getForumSurveyByTopic).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ responseLimit: 8, responseOffset: 8 })
      )
    );
    expect(await screen.findByText("Respondent 9")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(mocks.getForumSurveyByTopic).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ responseLimit: 8, responseOffset: 16 })
      )
    );
    expect(await screen.findByText("Respondent 17")).toBeInTheDocument();
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
  });

  it("keeps live results hidden from an open survey's public viewer", async () => {
    const survey = makeSurvey();
    mocks.getForumSurveyByTopic.mockResolvedValue({
      success: true,
      data: survey,
    });

    render(
      <ForumSurvey
        topicId={42}
        initialSurvey={survey}
        topicAuthor={MEMBER_ADDRESS}
      />
    );

    expect(
      screen.getByText(/Results are visible after you respond/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Results" })
    ).not.toBeInTheDocument();
  });

  it("shows the public immutable warning before submission", async () => {
    mocks.authenticated = true;
    mocks.address = MEMBER_ADDRESS as `0x${string}`;
    mocks.getAccessToken.mockResolvedValue("privy-token");
    const survey = makeSurvey({
      viewer: {
        authenticated: true,
        isMember: true,
        canRespond: true,
        hasResponded: false,
        response: null,
        address: MEMBER_ADDRESS,
      },
    });
    mocks.getForumSurveyByTopic.mockResolvedValue({
      success: true,
      data: survey,
    });

    render(
      <ForumSurvey
        topicId={42}
        initialSurvey={survey}
        topicAuthor="0x2222222222222222222222222222222222222222"
      />
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Review response" })
      ).toBeEnabled()
    );
    fireEvent.click(screen.getByLabelText("Harm prevention"));
    fireEvent.click(screen.getByRole("button", { name: "Review response" }));

    expect(
      screen.getByRole("heading", { name: "Submit your response?" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("This will be public and can’t be changed.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit response" }));
    await waitFor(() =>
      expect(mocks.submitForumSurvey).toHaveBeenCalledWith({
        surveyId: 7,
        answers: [{ questionId: 11, optionIds: [101] }],
        privyAccessToken: "privy-token",
      })
    );
  });

  it("lets topic staff authenticate for live results and keeps that auth while paging", async () => {
    mocks.authenticated = true;
    mocks.address = MEMBER_ADDRESS as `0x${string}`;
    mocks.getAccessToken.mockResolvedValue("privy-token");
    const publicSurvey = makeSurvey({
      viewer: {
        authenticated: true,
        isMember: false,
        canRespond: false,
        hasResponded: false,
        response: null,
        address: null,
        code: "NOT_MEMBER",
        error: "A Supporter Pass is required to respond",
      },
    });
    const staffSurvey = makeSurvey({
      responseCount: 9,
      canViewResults: true,
      responses: makeResponses(0, 8),
      viewer: {
        authenticated: true,
        isMember: false,
        canRespond: false,
        hasResponded: false,
        response: null,
        address: MEMBER_ADDRESS,
      },
    });
    mocks.getForumSurveyByTopic.mockImplementation(
      async (
        _topicId: number,
        viewer?: { jwt?: string; responseOffset?: number }
      ) => {
        if (!viewer?.jwt) return { success: true, data: publicSurvey };
        const offset = viewer.responseOffset ?? 0;
        return {
          success: true,
          data: {
            ...staffSurvey,
            responses: makeResponses(offset, offset === 0 ? 8 : 1),
          },
        };
      }
    );

    render(
      <ForumSurvey
        topicId={42}
        initialSurvey={publicSurvey}
        topicAuthor={MEMBER_ADDRESS}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Sign in to view results",
      })
    );
    await waitFor(() =>
      expect(mocks.getForumSurveyByTopic).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          jwt: "forum-jwt",
          privyAccessToken: undefined,
          responseLimit: 8,
          responseOffset: 0,
        })
      )
    );
    expect(
      await screen.findByRole("heading", { name: "Results" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(mocks.getForumSurveyByTopic).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          jwt: "forum-jwt",
          responseOffset: 8,
        })
      )
    );
    expect(await screen.findByText("Respondent 9")).toBeInTheDocument();
  });

  it("requires permanent-close confirmation before closing", async () => {
    mocks.authenticated = true;
    mocks.address = MEMBER_ADDRESS as `0x${string}`;
    mocks.getAccessToken.mockResolvedValue("privy-token");
    const survey = makeSurvey({
      viewer: {
        authenticated: true,
        isMember: true,
        canRespond: true,
        hasResponded: false,
        response: null,
        address: MEMBER_ADDRESS,
      },
    });
    mocks.getForumSurveyByTopic.mockResolvedValue({
      success: true,
      data: survey,
    });

    render(
      <ForumSurvey
        topicId={42}
        initialSurvey={survey}
        topicAuthor={MEMBER_ADDRESS}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Close poll" }));
    expect(
      await screen.findByRole("heading", { name: "Close this poll?" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Closing can.t be undone.*results become public/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close poll" }));
    await waitFor(() =>
      expect(mocks.closeForumSurvey).toHaveBeenCalledWith({
        surveyId: 7,
        address: MEMBER_ADDRESS,
        jwt: "forum-jwt",
      })
    );
  });
});
