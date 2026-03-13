import { describe, it, expect } from "vitest";
import { makeDaoNodeBase, makeOodaoBase, makeAtlasBase } from "./helpers";
import { deriveStandardStatus } from "../standard";

// ---------------------------------------------------------------------------
// STANDARD (dao_node)
// Uses decimals=0 so BigInt vote values equal the numbers we pass in.
// "ens" namespace: quorumBigInt = forVotes + abstainVotes
// ---------------------------------------------------------------------------

describe("deriveStandardStatus – dao_node", () => {
  function makeStandard(
    forVotes: string,
    againstVotes: string,
    abstainVotes: string,
    quorum: string,
    approvalThresholdBps = 0
  ) {
    return makeDaoNodeBase({
      totals: {
        "no-param": { "1": forVotes, "0": againstVotes, "2": abstainVotes },
      },
      quorum,
      proposal_type_info: {
        approval_threshold: approvalThresholdBps,
        name: "basic",
      },
    });
  }

  it("SUCCEEDED – quorum met and approval threshold met", () => {
    // forVotes=700, abstainVotes=100 → quorumVotes=800 ≥ quorum=500
    // approval% = 700/(700+100) ≈ 87.5% ≥ 51%
    const p = makeStandard("700", "100", "100", "500", 5100);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – quorum not met", () => {
    // forVotes=10, abstainVotes=5 → quorumVotes=15 < quorum=1000
    const p = makeStandard("10", "0", "5", "1000", 0);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("DEFEATED");
  });

  it("DEFEATED – approval threshold not met", () => {
    // forVotes=300, against=700, quorum=100 → quorumMet=true
    // approval% = 300/1000 = 30% < 51%
    const p = makeStandard("300", "700", "0", "100", 5100);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – zero approval threshold bypasses approval check", () => {
    // Even with against > for, threshold=0 passes approval check
    const p = makeStandard("200", "800", "0", "100", 0);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("SUCCEEDED");
  });

  it("SUCCEEDED – zero quorum bypasses quorum check (0n >= 0n)", () => {
    // quorum="0" → thresholds.quorum=0n; any quorumVotes≥0n satisfies
    const p = makeStandard("100", "50", "0", "0", 5100);
    // approval% = 100/150 ≈ 66.7% ≥ 51%
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("SUCCEEDED");
  });
});

// ---------------------------------------------------------------------------
// STANDARD (eas-oodao token-holders)
// ---------------------------------------------------------------------------

describe("deriveStandardStatus – eas-oodao", () => {
  function makeOodaoStandard(
    forVotes: string,
    againstVotes: string,
    abstainVotes: string,
    quorumBps: number,
    approvalThresholdBps: number,
    totalVP = "10000"
  ) {
    return makeOodaoBase({
      outcome: {
        "token-holders": {
          "1": forVotes,
          "0": againstVotes,
          "2": abstainVotes,
        },
      },
      proposal_type: {
        class: "STANDARD",
        quorum: quorumBps,
        approval_threshold: approvalThresholdBps,
      },
      total_voting_power_at_start: totalVP,
    });
  }

  it("SUCCEEDED – quorum and approval threshold met", () => {
    // totalVP=10000, quorumBps=3000 → absoluteQuorum=3000
    // forVotes=4000 > 3000 quorum and 100% approval
    const p = makeOodaoStandard("4000", "0", "0", 3000, 5100);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – quorum not met", () => {
    // absoluteQuorum=3000, forVotes=1000+0=1000 < 3000
    const p = makeOodaoStandard("1000", "0", "0", 3000, 0);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("DEFEATED");
  });

  it("DEFEATED – approval threshold not met", () => {
    // quorum met: forVotes=3500≥3000; approval=3500/10000=35%<51%
    const p = makeOodaoStandard("3500", "6500", "0", 3000, 5100);
    expect(deriveStandardStatus(p, "STANDARD", 0)).toBe("DEFEATED");
  });
});

// ---------------------------------------------------------------------------
// HYBRID_STANDARD
// ---------------------------------------------------------------------------

describe("deriveStandardStatus – HYBRID_STANDARD", () => {
  function makeHybridStd(
    delegateFor: string,
    delegateAgainst: string,
    userFor: number,
    userAgainst: number,
    totalVP: string,
    quorum: string,
    approvalThresholdBps: number
  ) {
    return {
      data_eng_properties: { source: "dao_node" },
      start_blocktime: Math.floor(Date.now() / 1000) - 3600,
      end_blocktime: Math.floor(Date.now() / 1000) - 60,
      hybrid: true,
      totals: {
        "no-param": { "1": delegateFor, "0": delegateAgainst, "2": "0" },
      },
      govless_proposal: {
        outcome: {
          USER: { "1": userFor, "0": userAgainst, "2": 0 },
          APP: {},
          CHAIN: {},
        },
      },
      total_voting_power_at_start: totalVP,
      quorum,
      proposal_type_info: {
        approval_threshold: approvalThresholdBps,
        name: "basic",
      },
    } as any;
  }

  it("SUCCEEDED – approval threshold met (hasMetThreshold=true)", () => {
    // eligibleDelegates=1000, delegateFor=700, delegateAgainst=100
    // userFor=400, userAgainst=100
    // forPct=700/1000*100*0.5=35; userForPct=400/1000*100*(1/6)=6.67 → forVotes≈41.67
    // againstPct=100/1000*100*0.5=5; userAgainstPct=100/1000*100*(1/6)=1.67 → againstVotes≈6.67
    // approvalPct = 41.67/(41.67+6.67)*100 ≈ 86% ≥ 51% → SUCCEEDED
    const p = makeHybridStd("700", "100", 400, 100, "1000", "100", 5100);
    expect(deriveStandardStatus(p, "HYBRID_STANDARD", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – neither threshold nor quorum met", () => {
    // eligibleDelegates=1000, delegateFor=100 (low), delegateAgainst=400
    // forVotes=100/1000*100*0.5=5 → againstVotes=400/1000*100*0.5=20
    // approvalPct=5/(5+20)*100=20% < 51% → threshold not met
    // quorumVotes=5 (ens: for+abstain) < Number("100")=100 → quorum not met
    // Neither → DEFEATED
    const p = makeHybridStd("100", "400", 0, 0, "1000", "100", 5100);
    expect(deriveStandardStatus(p, "HYBRID_STANDARD", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – quorum check met (quorumVotes >= Number(thresholds.quorum))", () => {
    // approvalThreshold=5100 (51%)
    // delegateFor=30, delegateAgainst=70 → approvalPct=30% < 51% → threshold not met
    // quorumVotes = 30 (ens: for+abstain)  ≥  Number("1")=1 → quorum met
    // OR condition: threshold OR quorum → SUCCEEDED
    const p = makeHybridStd("30", "70", 0, 0, "1000", "1", 5100);
    expect(deriveStandardStatus(p, "HYBRID_STANDARD", 0)).toBe("SUCCEEDED");
  });
});

// ---------------------------------------------------------------------------
// OFFCHAIN_STANDARD (eas-atlas) – inverted logic
// ---------------------------------------------------------------------------

describe("deriveStandardStatus – OFFCHAIN_STANDARD (eas-atlas)", () => {
  it("returns DEFEATED (inverted logic) when no votes exist", () => {
    // eas-atlas thresholds are always 0; with 0 forVotes, against=0:
    // quorumMet=true (quorumVotes≥0), hasMetThreshold=true (threshold=0)
    // inverted: if (quorumMet && hasMetThreshold) return "DEFEATED"
    const p = makeAtlasBase({
      proposal_type: "STANDARD",
      outcome: { USER: { "1": 0, "0": 0 }, APP: {}, CHAIN: {} },
    });
    expect(deriveStandardStatus(p, "OFFCHAIN_STANDARD", 0)).toBe("DEFEATED");
  });

  it("always returns DEFEATED for eas-atlas (zero thresholds from resolveArchiveThresholds)", () => {
    // With any votes, eas-atlas always returns DEFEATED due to inverted logic + zero thresholds
    const p = makeAtlasBase({
      proposal_type: "STANDARD",
      outcome: {
        USER: { "1": 500, "0": 100 },
        APP: { "1": 50 },
        CHAIN: { "1": 10 },
      },
    });
    expect(deriveStandardStatus(p, "OFFCHAIN_STANDARD", 0)).toBe("DEFEATED");
  });
});
