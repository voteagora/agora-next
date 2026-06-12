const VOTER_ALREADY_VOTED_PATTERN =
  /GovernorBravo::castVoteInternal:\s*voter already voted|voter already voted/i;

export const RELAY_VOTE_ERROR_CODES = {
  voterAlreadyVoted: "VOTER_ALREADY_VOTED",
} as const;

export function getRelayVoteErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function getRelayVoteClientError(error: unknown) {
  const message = getRelayVoteErrorMessage(error);

  if (VOTER_ALREADY_VOTED_PATTERN.test(message)) {
    return {
      status: 409,
      code: RELAY_VOTE_ERROR_CODES.voterAlreadyVoted,
      error: "You have already voted on this proposal",
    };
  }

  return null;
}
