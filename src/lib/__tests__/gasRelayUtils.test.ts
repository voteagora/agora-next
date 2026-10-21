import { describe, expect, it } from "vitest";
import { isGasRelayEligible } from "@/lib/gasRelayUtils";

const base = {
  enabled: true,
  sponsorBalance: BigInt("200000000000000000"), // 0.2 ETH
  minBalance: "0.1",
  minVPToUseGasRelay: "10",
};

describe("isGasRelayEligible", () => {
  it("is false when the relay is disabled", () => {
    expect(
      isGasRelayEligible({
        ...base,
        enabled: false,
        totalVP: "100",
        tokenBalance: 100n,
      })
    ).toBe(false);
  });

  it("is false when the sponsor balance is below the minimum", () => {
    expect(
      isGasRelayEligible({
        ...base,
        sponsorBalance: BigInt("10000000000000000"), // 0.01 ETH
        totalVP: "100",
        tokenBalance: 100n,
      })
    ).toBe(false);
  });

  it("qualifies on snapshot voting power alone", () => {
    expect(
      isGasRelayEligible({ ...base, totalVP: "100", tokenBalance: 0n })
    ).toBe(true);
  });

  it("qualifies on current token balance alone when snapshot VP is 0", () => {
    expect(
      isGasRelayEligible({ ...base, totalVP: "0", tokenBalance: 11n })
    ).toBe(true);
  });

  it("uses a strict greater-than against the threshold", () => {
    expect(
      isGasRelayEligible({ ...base, totalVP: "10", tokenBalance: 10n })
    ).toBe(false);
    expect(
      isGasRelayEligible({
        ...base,
        minVPToUseGasRelay: "0",
        totalVP: "0",
        tokenBalance: 1n,
      })
    ).toBe(true);
    expect(
      isGasRelayEligible({
        ...base,
        minVPToUseGasRelay: "0",
        totalVP: "0",
        tokenBalance: 0n,
      })
    ).toBe(false);
  });

  it("does not qualify on balance while the balance is still loading", () => {
    expect(
      isGasRelayEligible({ ...base, totalVP: "0", tokenBalance: undefined })
    ).toBe(false);
  });

  it("treats missing voting power as 0", () => {
    expect(
      isGasRelayEligible({ ...base, totalVP: undefined, tokenBalance: 0n })
    ).toBe(false);
  });
});
