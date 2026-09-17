import { describe, expect, it } from "vitest";
import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  encodeErrorResult,
} from "viem";
import { ConnectorChainMismatchError } from "wagmi";
import { extractFailedEasTxContext } from "@/lib/easTxContext";
import {
  classifyVoteError,
  isContractRevertCode,
  parseVoteError,
  VOTE_ERROR_SELECTORS,
  VOTE_RESOLVER_ERRORS_ABI,
  VoteSubmissionError,
} from "@/lib/voteErrorUtils";

const PANIC_ABI = [
  { type: "error", name: "Panic", inputs: [{ name: "code", type: "uint256" }] },
] as const;
const ERROR_STRING_ABI = [
  {
    type: "error",
    name: "Error",
    inputs: [{ name: "reason", type: "string" }],
  },
] as const;

function revertError(data: `0x${string}`) {
  const cause = new ContractFunctionRevertedError({
    abi: [...VOTE_RESOLVER_ERRORS_ABI],
    data,
    functionName: "attest",
  });
  return new ContractFunctionExecutionError(cause, {
    abi: [],
    functionName: "attest",
  });
}

describe("classifyVoteError", () => {
  it("maps every known selector from a legacy message substring", () => {
    for (const [selector, entry] of Object.entries(VOTE_ERROR_SELECTORS)) {
      const error = new Error(`execution reverted (data="${selector}")`);
      expect(classifyVoteError(error)).toEqual({
        code: entry.code,
        message: entry.message,
      });
    }
  });

  it("decodes viem ContractFunctionRevertedError by error name", () => {
    const data = encodeErrorResult({
      abi: [...VOTE_RESOLVER_ERRORS_ABI],
      errorName: "AlreadyVoted",
    });
    const result = classifyVoteError(revertError(data));
    expect(result.code).toBe("ALREADY_VOTED");
    expect(result.message).toBe("You have already voted on this proposal");
  });

  it("decodes a resolver assert (Panic 0x01) as a proposal data mismatch", () => {
    const data = encodeErrorResult({
      abi: PANIC_ABI,
      errorName: "Panic",
      args: [1n],
    });
    expect(classifyVoteError(revertError(data)).code).toBe(
      "PROPOSAL_DATA_MISMATCH"
    );
    // Also from raw hex buried in an ethers-style message
    expect(
      classifyVoteError(new Error(`call revert exception; data=${data}`)).code
    ).toBe("PROPOSAL_DATA_MISMATCH");
  });

  it("decodes Error(string) reverts", () => {
    const data = encodeErrorResult({
      abi: ERROR_STRING_ABI,
      errorName: "Error",
      args: ["nope"],
    });
    expect(classifyVoteError(revertError(data))).toEqual({
      code: "CONTRACT_ERROR",
      message: "Transaction reverted: nope",
    });
  });

  it("finds revert data nested under cause.data", () => {
    const error = new Error("boom") as Error & { cause: unknown };
    error.cause = { data: "0x7a19ed05" };
    expect(classifyVoteError(error).code).toBe("VOTING_ENDED");
  });

  it("maps viem user rejections", () => {
    const error = new UserRejectedRequestError(new Error("User denied"));
    expect(classifyVoteError(error).code).toBe("USER_REJECTED");
  });

  it("maps EIP-1193 code 4001 rejections", () => {
    const error = Object.assign(new Error("User rejected the request."), {
      code: 4001,
    });
    expect(classifyVoteError(error).code).toBe("USER_REJECTED");
  });

  it("maps wagmi connector chain mismatches to WRONG_CHAIN", () => {
    const error = new ConnectorChainMismatchError({
      connectionChainId: 1,
      connectorChainId: 8453,
    });
    expect(classifyVoteError(error).code).toBe("WRONG_CHAIN");
  });

  it("passes VoteSubmissionError through untouched", () => {
    const error = new VoteSubmissionError("WRONG_CHAIN", "switch please");
    expect(classifyVoteError(error)).toEqual({
      code: "WRONG_CHAIN",
      message: "switch please",
    });
  });

  it("falls back to the raw message for unknown errors", () => {
    expect(classifyVoteError(new Error("something odd"))).toEqual({
      code: "UNKNOWN",
      message: "something odd",
    });
    expect(classifyVoteError(undefined)).toEqual({
      code: "UNKNOWN",
      message: "Failed to submit vote",
    });
    expect(classifyVoteError(new BaseError("viem odd")).code).toBe("UNKNOWN");
  });

  it("parseVoteError returns only the message", () => {
    expect(parseVoteError(new Error("0x7c9a1cf9"))).toBe(
      "You have already voted on this proposal"
    );
  });

  it("flags contract revert codes", () => {
    expect(isContractRevertCode("ALREADY_VOTED")).toBe(true);
    expect(isContractRevertCode("PROPOSAL_DATA_MISMATCH")).toBe(true);
    expect(isContractRevertCode("WRONG_CHAIN")).toBe(false);
    expect(isContractRevertCode("UNKNOWN")).toBe(false);
  });
});

describe("VoteSubmissionError", () => {
  it("exposes tx context for Mirador failure artifacts", () => {
    const error = new VoteSubmissionError("REVERTED", "reverted", {
      txInputData: "0xdead",
      chainId: 1,
      txHash: "0xbeef",
    });
    expect(extractFailedEasTxContext(error)).toEqual({
      txHash: "0xbeef",
      chainId: 1,
      txInputData: "0xdead",
    });
    expect(error.name).toBe("VoteSubmissionError");
    expect(error).toBeInstanceOf(Error);
  });
});
