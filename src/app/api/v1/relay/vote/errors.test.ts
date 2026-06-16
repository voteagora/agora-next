import { describe, expect, it } from "vitest";

import { getRelayVoteClientError } from "./errors";

describe("getRelayVoteClientError", () => {
  it("maps GovernorBravo already-voted reverts to a user-actionable 409", () => {
    const error = new Error(
      'The contract function "castVoteBySig" reverted with the following reason:\n' +
        "GovernorBravo::castVoteInternal: voter already voted"
    );

    expect(getRelayVoteClientError(error)).toEqual({
      status: 409,
      code: "VOTER_ALREADY_VOTED",
      error: "You have already voted on this proposal",
    });
  });

  it("leaves unknown relay errors as internal failures", () => {
    expect(getRelayVoteClientError(new Error("RPC unavailable"))).toBeNull();
  });
});
