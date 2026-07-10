import { describe, expect, it } from "vitest";

import { formatVotingPower, formatVotingPowerString } from "./votingPowerUtils";

describe("voting power formatting", () => {
  it("preserves whole ERC-721 voting units", () => {
    expect(formatVotingPower(1n, 0)).toBe(1);
    expect(formatVotingPowerString(1n, 0)).toBe("1");
  });

  it("formats 18-decimal ERC-20 voting units", () => {
    const votingPower = 12_500_000_000_000_000_000n;

    expect(formatVotingPower(votingPower, 18)).toBe(12);
    expect(formatVotingPowerString(votingPower, 18)).toBe("12.50");
  });

  it("supports tokens with fewer decimals than the display precision", () => {
    expect(formatVotingPowerString(15n, 1, 2)).toBe("1.5");
  });

  it("rejects invalid decimal configurations", () => {
    expect(() => formatVotingPower(1n, -1)).toThrow(
      "Token decimals must be a non-negative integer"
    );
  });
});
