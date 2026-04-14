import { describe, it, expect } from "vitest";
import { makeDaoNodeBase, makeAtlasBase } from "./helpers";
import { deriveApprovalStatus } from "../approval";

// ---------------------------------------------------------------------------
// APPROVAL (dao_node)
// ---------------------------------------------------------------------------

describe("deriveApprovalStatus – APPROVAL dao_node", () => {
  /** Construct a 2-option approval proposal */
  function makeApproval(
    opt0Votes: string,
    opt1Votes: string,
    forQuorum: string,
    quorum: string,
    criteria: number, // 0=THRESHOLD, 1=TOP_CHOICES
    criteriaValue: string // for THRESHOLD: min votes per option
  ) {
    return makeDaoNodeBase({
      voting_module_name: "approval",
      totals: {
        "no-param": { "1": forQuorum, "0": "0", "2": "0" },
        "0": { "1": opt0Votes },
        "1": { "1": opt1Votes },
      },
      quorum,
      // decoded_proposal_data: options + settings
      decoded_proposal_data: [
        [
          [[], [], [], null, "Option A"], // opt 0, length 5 = newer format
          [[], [], [], null, "Option B"], // opt 1
        ],
        [1, criteria, "", criteriaValue, "0"],
      ],
    });
  }

  it("SUCCEEDED – TOP_CHOICES, quorum met", () => {
    // quorumVotes = 0+0+1000 = 1000 (for+abstain+against BigInt); quorum=500
    // no-param["1"]=1000(for),"0"=0(against),"2"=0(abstain) → quorumVotes=1000
    // quorum=500 → 1000≥500 → quorum met; criteria=1 → SUCCEEDED
    const p = makeApproval("300", "700", "1000", "500", 1, "0");
    expect(deriveApprovalStatus(p, "APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – quorum not met (all vote counts too low)", () => {
    // quorumVotes=100; quorum=500 → DEFEATED
    const p = makeApproval("30", "70", "100", "500", 1, "0");
    expect(deriveApprovalStatus(p, "APPROVAL", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – THRESHOLD criteria, option1 exceeds threshold", () => {
    // quorum met (1000≥500); criteria=0 (THRESHOLD), criteriaValue=600
    // opt0=300 < 600; opt1=700 > 600 → SUCCEEDED
    const p = makeApproval("300", "700", "1000", "500", 0, "600");
    expect(deriveApprovalStatus(p, "APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – THRESHOLD criteria, no options exceed threshold", () => {
    // quorum met; criteria=0 (THRESHOLD), criteriaValue=800
    // opt0=300, opt1=700 both < 800 → DEFEATED
    const p = makeApproval("300", "700", "1000", "500", 0, "800");
    expect(deriveApprovalStatus(p, "APPROVAL", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – TOP_CHOICES with zero quorum (no quorum check)", () => {
    // quorum=0 → quorumValue=0 → quorum check skipped (quorumValue>0 is false)
    const p = makeApproval("10", "20", "30", "0", 1, "0");
    expect(deriveApprovalStatus(p, "APPROVAL", 0)).toBe("SUCCEEDED");
  });
});

// ---------------------------------------------------------------------------
// OFFCHAIN_APPROVAL (eas-atlas)
// Quorum uses unique voter count (num_of_votes), not vote weight
// ---------------------------------------------------------------------------

describe("deriveApprovalStatus – OFFCHAIN_APPROVAL", () => {
  function makeOffchainApproval(
    numVoters: number,
    quorum: string,
    criteria: number,
    criteriaValue: string,
    opt0UserVotes: number,
    opt0AppVotes: number
  ) {
    return makeAtlasBase({
      proposal_type: "APPROVAL",
      onchain_proposalid: 0,
      num_of_votes: numVoters,
      quorum,
      kwargs: {
        choices: ["Option A", "Option B"],
        criteria,
        criteria_value: criteriaValue,
        max_approvals: 2,
        budget_token: "",
        budget_amount: "0",
      },
      outcome: {
        USER: { "0": { "1": opt0UserVotes } },
        APP: { "0": { "1": opt0AppVotes } },
        CHAIN: {},
      },
    });
  }

  it("DEFEATED – unique voter count below quorum", () => {
    const p = makeOffchainApproval(20, "50", 1, "0", 10, 5);
    expect(deriveApprovalStatus(p, "OFFCHAIN_APPROVAL", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – TOP_CHOICES, voter count meets quorum", () => {
    const p = makeOffchainApproval(60, "50", 1, "0", 10, 5);
    expect(deriveApprovalStatus(p, "OFFCHAIN_APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("SUCCEEDED – THRESHOLD criteria, option exceeds threshold", () => {
    // numVoters=60≥quorum=50; criteria=0, criteriaValue=50; opt0Votes=USER(200)+APP(10)=210>50
    const p = makeOffchainApproval(60, "50", 0, "50", 200, 10);
    expect(deriveApprovalStatus(p, "OFFCHAIN_APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – THRESHOLD criteria, no option exceeds threshold", () => {
    // numVoters=60≥50; criteriaValue=500; opt0=5+2=7 < 500 → DEFEATED
    const p = makeOffchainApproval(60, "50", 0, "500", 5, 2);
    expect(deriveApprovalStatus(p, "OFFCHAIN_APPROVAL", 0)).toBe("DEFEATED");
  });
});

// ---------------------------------------------------------------------------
// HYBRID_APPROVAL
// Weighted unique participation ≥ 30% for quorum
// ---------------------------------------------------------------------------

describe("deriveApprovalStatus – HYBRID_APPROVAL", () => {
  function makeHybridApproval(
    delegateFor: string,
    delegateAgainst: string,
    quorum: string, // raw quorum → eligibleDelegates = quorum * (100/30)
    appsMax: number,
    usersMax: number,
    chainsMax: number,
    criteria: number,
    criteriaValue: string,
    opt0DelegateVotes: string,
    opt0AppVotes: number,
    opt0UserVotes: number,
    opt0ChainVotes: number
  ) {
    return {
      data_eng_properties: { source: "dao_node" },
      start_blocktime: Math.floor(Date.now() / 1000) - 3600,
      end_blocktime: Math.floor(Date.now() / 1000) - 60,
      hybrid: true,
      voting_module_name: "approval",
      totals: {
        "no-param": { "1": delegateFor, "0": delegateAgainst },
        "0": { "1": opt0DelegateVotes },
      },
      quorum,
      govless_proposal: {
        outcome: {
          APP: { "0": { "1": appsMax } },
          USER: { "0": { "1": usersMax } },
          CHAIN: { "0": { "1": chainsMax } },
        },
      },
      decoded_proposal_data: [
        [[[], [], [], null, "Option A"]],
        [1, criteria, "", criteriaValue, "0"],
      ],
    } as any;
  }

  it("SUCCEEDED – weighted participation ≥ 30%, TOP_CHOICES", () => {
    // quorum=600 → eligibleDelegates=600*(100/30)=2000
    // delegateTotal=1200/2000*100*0.5=30 → uniqueParticipation=30≥30 → SUCCEEDED (TOP_CHOICES)
    const p = makeHybridApproval(
      "1000",
      "200",
      "600",
      0,
      0,
      0,
      1,
      "0",
      "1000",
      0,
      0,
      0
    );
    expect(deriveApprovalStatus(p, "HYBRID_APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – weighted participation < 30%", () => {
    // quorum=600 → eligibleDelegates=2000
    // delegateTotal=500/2000*100*0.5=12.5 < 30 → DEFEATED
    const p = makeHybridApproval(
      "300",
      "200",
      "600",
      0,
      0,
      0,
      1,
      "0",
      "300",
      0,
      0,
      0
    );
    expect(deriveApprovalStatus(p, "HYBRID_APPROVAL", 0)).toBe("DEFEATED");
  });

  it("SUCCEEDED – THRESHOLD criteria, option weighted% meets threshold", () => {
    // uniqueParticipation=30 (just meets quorum)
    // opt0DelegateVotes=1000; delegateWgt=1000/2000*0.5*100=25
    // opt0AppVotes=50; appWgt=50/100*(1/6)*100=8.33
    // totalWeightedPct≈33.33 ≥ criteriaValue=3000bps=30% → SUCCEEDED
    const p = makeHybridApproval(
      "1000",
      "200",
      "600",
      50,
      0,
      0,
      0,
      "3000",
      "1000",
      50,
      0,
      0
    );
    expect(deriveApprovalStatus(p, "HYBRID_APPROVAL", 0)).toBe("SUCCEEDED");
  });

  it("DEFEATED – THRESHOLD criteria compares against percentage, not fraction", () => {
    // uniqueParticipation=30 (meets quorum from delegate participation)
    // opt0DelegateVotes=200 -> weightedPct=200/2000*0.5*100 = 5%
    // criteriaValue=3000bps = 30%, so this must fail
    const p = makeHybridApproval(
      "1000",
      "200",
      "600",
      0,
      0,
      0,
      0,
      "3000",
      "200",
      0,
      0,
      0
    );
    expect(deriveApprovalStatus(p, "HYBRID_APPROVAL", 0)).toBe("DEFEATED");
  });

  it("DEFEATED – THRESHOLD criteria, option weighted% below threshold", () => {
    // uniqueParticipation=30 (meets quorum from delegate participation)
    // criteriaValue=8000bps → thresholdPct=8000/10000=0.8
    // opt0DelegateVotes=0, no citizen votes → weightedPct=0 < 0.8 → DEFEATED
    const p = makeHybridApproval(
      "1000",
      "200",
      "600",
      0,
      0,
      0,
      0,
      "8000",
      "0",
      0,
      0,
      0
    );
    expect(deriveApprovalStatus(p, "HYBRID_APPROVAL", 0)).toBe("DEFEATED");
  });
});
