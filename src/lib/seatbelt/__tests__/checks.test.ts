import { describe, expect, it, vi } from "vitest";

import { findMatchingCall } from "../checks/call-trace";
import { runChecks } from "../runChecks";
import type {
  ProposalCheck,
  ProposalData,
  ProposalEvent,
  TenderlySimulation,
} from "../types";

const TIMELOCK = "0x0eDd4B2cCCf41453D8B5443FBB96cc577d1d06bF";
const CALLDATA = "0xa9059cbb";

describe("findMatchingCall", () => {
  it("does not throw on calls with an empty or missing from, and still finds a deeper match", () => {
    const match = { from: TIMELOCK.toLowerCase(), input: CALLDATA };
    const calls = [
      {
        from: "0x1111111111111111111111111111111111111111",
        input: "0x",
        calls: [
          { from: "", input: "0x" },
          {
            input: "0x",
            calls: [{ from: "", input: CALLDATA, calls: [match] }],
          },
        ],
      },
    ];

    expect(findMatchingCall(TIMELOCK, CALLDATA, calls)).toBe(match);
  });

  it("matches the from address case-insensitively", () => {
    const match = {
      from: TIMELOCK.toUpperCase().replace("0X", "0x"),
      input: CALLDATA,
    };
    expect(findMatchingCall(TIMELOCK.toLowerCase(), CALLDATA, [match])).toBe(
      match
    );
  });

  it("returns null when nothing matches or there are no calls", () => {
    expect(findMatchingCall(TIMELOCK, CALLDATA, [])).toBeNull();
    expect(findMatchingCall(TIMELOCK, CALLDATA, undefined)).toBeNull();
    expect(
      findMatchingCall(TIMELOCK, CALLDATA, [{ from: "", input: CALLDATA }])
    ).toBeNull();
  });
});

describe("runChecks", () => {
  it("reports a throwing check as an error row without failing the other checks", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const checks: Record<string, ProposalCheck> = {
      good: {
        name: "Good check",
        checkProposal: async () => ({
          info: ["fine"],
          warnings: [],
          errors: [],
        }),
      },
      bad: {
        name: "Bad check",
        checkProposal: async () => {
          throw new Error("invalid address");
        },
      },
    };

    const results = await runChecks(
      checks,
      {} as ProposalEvent,
      {} as TenderlySimulation,
      {} as ProposalData
    );

    expect(results.good).toEqual({
      name: "Good check",
      result: { info: ["fine"], warnings: [], errors: [] },
    });
    expect(results.bad).toEqual({
      name: "Bad check",
      result: {
        info: [],
        warnings: [],
        errors: ["Check failed to run: invalid address"],
      },
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
