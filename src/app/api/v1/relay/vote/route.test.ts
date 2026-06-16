import { beforeEach, describe, expect, it, vi } from "vitest";

const appendServerTraceEventMock = vi.fn();
const authenticateApiUserMock = vi.fn();
const voteBySignatureApiMock = vi.fn();

vi.mock("@/app/lib/auth/serverAuth", () => ({
  authenticateApiUser: authenticateApiUserMock,
}));

vi.mock("./castVote", () => ({
  voteBySignatureApi: voteBySignatureApiMock,
}));

vi.mock("@/lib/mirador/requestContext", () => ({
  getMiradorTraceContextFromHeaders: vi.fn(() => ({
    traceId: "trace-id",
    flow: "governance_vote",
  })),
}));

vi.mock("@/lib/mirador/serverTrace", () => ({
  appendServerTraceEvent: appendServerTraceEventMock,
  withMiradorTraceStep: vi.fn((traceContext, step, source) => ({
    ...traceContext,
    step,
    source,
  })),
}));

vi.mock("@/lib/apiMonitoring", () => ({
  withApiRouteMonitoring: vi.fn((_name, handler) => handler),
}));

describe("POST /api/v1/relay/vote", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    authenticateApiUserMock.mockResolvedValue({ authenticated: true });
  });

  it("returns a user-actionable conflict when the voter already voted", async () => {
    voteBySignatureApiMock.mockRejectedValue(
      new Error(
        'The contract function "castVoteBySig" reverted with the following reason:\n' +
          "GovernorBravo::castVoteInternal: voter already voted"
      )
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/v1/relay/vote", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          signature: "0xabc123",
          proposalId: "96",
          support: 1,
        }),
      }) as never
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "You have already voted on this proposal",
      code: "VOTER_ALREADY_VOTED",
    });
    expect(appendServerTraceEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "relay_vote_request_failed",
        details: expect.objectContaining({
          code: "VOTER_ALREADY_VOTED",
          status: 409,
        }),
      })
    );
  });
});
