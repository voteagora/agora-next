import { describe, it, expect } from "vitest";
import { makeDaoNodeBase, makeOodaoBase, makeAtlasBase } from "./helpers";
import { deriveOptimisticStatus } from "../optimistic";

// ---------------------------------------------------------------------------
// OPTIMISTIC (dao_node)
// ---------------------------------------------------------------------------

describe("deriveOptimisticStatus – OPTIMISTIC dao_node", () => {
  function makeOptimistic(
    againstVotes: string,
    totalVP: string,
    thresholdBps: number,
    isRelative: boolean
  ) {
    return makeDaoNodeBase({
      voting_module_name: "optimistic",
      totals: { "no-param": { "0": againstVotes } },
      total_voting_power_at_start: totalVP,
      decoded_proposal_data: [[thresholdBps, isRelative ? 1 : 0]],
    });
  }

  it("SUCCEEDED – no against votes", () => {
    const p = makeOptimistic("0", "10000", 2000, true);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 18)).toBe("SUCCEEDED");
  });

  it("SUCCEEDED – relative threshold: against below threshold", () => {
    // threshold = 10000 * 2000 / 10000 = 2000; against=1500 ≤ 2000 → SUCCEEDED
    const p = makeOptimistic("1500", "10000", 2000, true);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – relative threshold: against exceeds threshold", () => {
    // threshold = 10000 * 2000 / 10000 = 2000; against=2001 > 2000 → DEFEATED
    const p = makeOptimistic("2001", "10000", 2000, true);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – at exact threshold (strictly >, not >=)", () => {
    // against = threshold exactly → SUCCEEDED (not defeated)
    const p = makeOptimistic("2000", "10000", 2000, true);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("SUCCEEDED – absolute threshold: against ≤ threshold", () => {
    // isRelative=false → threshold = BigInt(500); against=300 ≤ 500 → SUCCEEDED
    const p = makeOptimistic("300", "10000", 500, false);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – absolute threshold: against > threshold", () => {
    const p = makeOptimistic("501", "10000", 500, false);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – missing decoded_proposal_data uses 50% default threshold", () => {
    const p = makeDaoNodeBase({
      voting_module_name: "optimistic",
      totals: { "no-param": { "0": "4999" } },
      total_voting_power_at_start: "10000",
      // no decoded_proposal_data → default = supply/2 = 5000
    });
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – missing decoded_proposal_data: against > 50% of supply", () => {
    const p = makeDaoNodeBase({
      voting_module_name: "optimistic",
      totals: { "no-param": { "0": "5001" } },
      total_voting_power_at_start: "10000",
    });
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("DEFEATED");
  });
});

// ---------------------------------------------------------------------------
// OPTIMISTIC (eas-oodao)
// ---------------------------------------------------------------------------

describe("deriveOptimisticStatus – OPTIMISTIC eas-oodao", () => {
  function makeOodaoOptimistic(
    againstVotes: string,
    totalVP: string,
    approvalThresholdBps: number
  ) {
    return makeOodaoBase({
      voting_module: "OPTIMISTIC",
      outcome: { "token-holders": { "0": againstVotes } },
      total_voting_power_at_start: totalVP,
      proposal_type: {
        class: "OPTIMISTIC",
        approval_threshold: approvalThresholdBps,
      },
    });
  }

  it("SUCCEEDED – against below threshold", () => {
    // threshold = 10000 * 2000 / 10000 = 2000; against=1000 ≤ 2000 → SUCCEEDED
    const p = makeOodaoOptimistic("1000", "10000", 2000);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – against exceeds threshold", () => {
    const p = makeOodaoOptimistic("2001", "10000", 2000);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – zero approval_threshold uses 50% default", () => {
    // threshold = supply/2 = 5000; against=4999 → SUCCEEDED
    const p = makeOodaoOptimistic("4999", "10000", 0);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – zero approval_threshold, against > 50%", () => {
    const p = makeOodaoOptimistic("5001", "10000", 0);
    expect(deriveOptimisticStatus(p, "OPTIMISTIC", 0)).toBe("DEFEATED");
  });
});

// ---------------------------------------------------------------------------
// HYBRID_OPTIMISTIC_TIERED
// calculateTieredVeto uses lowercase "apps"/"users"/"chains" keys in offchainData
// Defaults: HYBRID_OPTIMISTIC_TIERED_THRESHOLD = [55, 45, 35]
// delegateVeto = (delegateAgainst / totalVotingPower) * 100
// ---------------------------------------------------------------------------

describe("deriveOptimisticStatus – HYBRID_OPTIMISTIC_TIERED", () => {
  function makeHybridOptTiered(
    delegateAgainst: string,
    totalVP: string,
    appsAgainst: number,
    usersAgainst: number,
    chainsAgainst: number,
    customTiers?: number[]
  ) {
    return {
      data_eng_properties: { source: "dao_node" },
      start_blocktime: Math.floor(Date.now() / 1000) - 3600,
      end_blocktime: Math.floor(Date.now() / 1000) - 60,
      hybrid: true,
      voting_module_name: "optimistic",
      totals: { "no-param": { "0": delegateAgainst } },
      total_voting_power_at_start: totalVP,
      govless_proposal: {
        outcome: {
          // calculateTieredVeto looks for lowercase keys "apps", "users", "chains"
          apps: { "0": appsAgainst },
          users: { "0": usersAgainst },
          chains: { "0": chainsAgainst },
        },
        ...(customTiers ? { tiers: customTiers } : {}),
      },
    } as any;
  }

  it("SUCCEEDED – no veto votes", () => {
    const p = makeHybridOptTiered("0", "10000", 0, 0, 0);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("SUCCEEDED – single group above tiers[0] but no coalition (1 < 2)", () => {
    // delegateVeto = 0, appVeto = 60/100*100 = 60% ≥ 55; only 1 group → not vetoed
    const p = makeHybridOptTiered("0", "10000", 60, 0, 0);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("DEFEATED – 2 groups each ≥ tiers[0]=55 (2-group coalition)", () => {
    // delegateVeto=6000/10000*100=60% ≥ 55; appVeto=60/100*100=60% ≥ 55 → 2 groups → veto
    const p = makeHybridOptTiered("6000", "10000", 60, 0, 0);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });

  it("DEFEATED – 3 groups each ≥ tiers[1]=45", () => {
    // delegate=50%≥45, app=50/100*100=50%≥45, user=500/1000*100=50%≥45 → 3 groups
    const p = makeHybridOptTiered("5000", "10000", 50, 500, 0);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });

  it("DEFEATED – all 4 groups each ≥ tiers[2]=35", () => {
    // delegate=40%≥35, app=40/100*100=40%≥35, user=400/1000*100=40%≥35, chain=7/15*100≈46%≥35
    const p = makeHybridOptTiered("4000", "10000", 40, 400, 7);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });

  it("SUCCEEDED – custom tiers used directly (no basis-point conversion)", () => {
    // Custom tiers = [60, 50, 40]; all groups at 45% → countExceeding(40)=4, countExceeding(50)=0
    // delegate=4500/10000*100=45≥40, app=45/100*100=45≥40, user=450/1000*100=45≥40, chain=7/15*100≈47≥40
    // All 4 ≥ tiers[2]=40 → DEFEATED
    const p = makeHybridOptTiered("4500", "10000", 45, 450, 7, [60, 50, 40]);
    expect(deriveOptimisticStatus(p, "HYBRID_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });
});

// ---------------------------------------------------------------------------
// OFFCHAIN_OPTIMISTIC (eas-atlas, no delegates)
// Falls through calculateTieredVeto with OFFCHAIN_OPTIMISTIC_THRESHOLD = [20,20,20]
// Veto: 2+ groups each ≥ 20% (3-group average NOT used here)
// ---------------------------------------------------------------------------

describe("deriveOptimisticStatus – OFFCHAIN_OPTIMISTIC", () => {
  function makeOffchainOpt(
    appsAgainst: number,
    usersAgainst: number,
    chainsAgainst: number
  ) {
    return makeAtlasBase({
      proposal_type: "OPTIMISTIC",
      onchain_proposalid: 0, // pure offchain
      outcome: {
        // calculateTieredVeto uses lowercase "apps"/"users"/"chains"
        apps: { "0": appsAgainst },
        users: { "0": usersAgainst },
        chains: { "0": chainsAgainst },
      },
    });
  }

  it("SUCCEEDED – no veto votes", () => {
    const p = makeOffchainOpt(0, 0, 0);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("SUCCEEDED – only 1 group at 20%+ (need 2 for veto)", () => {
    // app=25/100*100=25%≥20; user=0; chain=0 → only 1 group → not vetoed
    const p = makeOffchainOpt(25, 0, 0);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("DEFEATED – 2 groups each ≥ 20%", () => {
    // app=25%≥20, user=250/1000*100=25%≥20 → 2 groups → veto
    const p = makeOffchainOpt(25, 250, 0);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC", 0)).toBe(
      "DEFEATED"
    );
  });

  it("DEFEATED – all 3 citizen groups ≥ 20%", () => {
    const p = makeOffchainOpt(25, 250, 4); // chain=4/15*100≈26.7%≥20
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC", 0)).toBe(
      "DEFEATED"
    );
  });
});

// ---------------------------------------------------------------------------
// OFFCHAIN_OPTIMISTIC_TIERED (eas-atlas)
// avgVeto = (appVeto + userVeto + chainVeto) / 3 >= tiers[0]
// Default tiers: OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD = [65, 65, 65]
// ---------------------------------------------------------------------------

describe("deriveOptimisticStatus – OFFCHAIN_OPTIMISTIC_TIERED", () => {
  function makeOffchainTiered(
    appsAgainst: number,
    usersAgainst: number,
    chainsAgainst: number,
    customTiers?: number[]
  ) {
    return makeAtlasBase({
      proposal_type: "OPTIMISTIC_TIERED",
      onchain_proposalid: 0,
      outcome: {
        apps: { "0": appsAgainst },
        users: { "0": usersAgainst },
        chains: { "0": chainsAgainst },
      },
      ...(customTiers ? { tiers: customTiers } : {}),
    });
  }

  it("SUCCEEDED – average veto below default 65% threshold", () => {
    // app=60%,user=50%,chain=40% → avg=50% < 65% → SUCCEEDED
    const p = makeOffchainTiered(60, 500, 6);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC_TIERED", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("DEFEATED – average veto meets default 65% threshold", () => {
    // app=70%,user=65%,chain=60% → avg=65% = 65% → DEFEATED (>=)
    const p = makeOffchainTiered(70, 650, 9);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });

  it("DEFEATED – average veto exceeds threshold", () => {
    // app=80%,user=75%,chain=66% → avg≈73.7% > 65% → DEFEATED
    const p = makeOffchainTiered(80, 750, 10);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });

  it("SUCCEEDED – custom tiers used directly (no bps conversion)", () => {
    // Custom tiers=[30,30,30]; app=25%,user=20%,chain=20% → avg≈21.7% < 30 → SUCCEEDED
    const p = makeOffchainTiered(25, 200, 3, [30, 30, 30]);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC_TIERED", 0)).toBe(
      "SUCCEEDED"
    );
  });

  it("DEFEATED – custom tiers: average meets threshold", () => {
    // Custom tiers=[30,30,30]; app=35%,user=30%,chain=30% → avg≈31.7% ≥ 30 → DEFEATED
    const p = makeOffchainTiered(35, 300, 5, [30, 30, 30]);
    expect(deriveOptimisticStatus(p, "OFFCHAIN_OPTIMISTIC_TIERED", 0)).toBe(
      "DEFEATED"
    );
  });
});
