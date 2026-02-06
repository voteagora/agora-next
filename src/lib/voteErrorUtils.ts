/**
 * Parses vote submission errors and returns user-friendly error messages
 * @param error - The error object or message from vote submission
 * @returns A user-friendly error message string
 */
export function parseVoteError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // EAS contract error codes
  if (errorMessage.includes("0xb8daf542")) {
    return "Invalid attester - you are not authorized to vote on this proposal";
  }

  if (errorMessage.includes("0x7c9a1cf9")) {
    return "You have already voted on this proposal";
  }

  if (errorMessage.includes("0x7fa01202")) {
    return "Voting has not started yet";
  }

  if (errorMessage.includes("0x7a19ed05")) {
    return "Voting has ended for this proposal";
  }

  // Default error message
  return error instanceof Error ? error.message : "Failed to submit vote";
}
