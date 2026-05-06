import { describe, it, expect } from "vitest";
import { makeDaoNodeBase, now } from "./helpers";
import { deriveStatus } from "../deriveStatus";

// ---------------------------------------------------------------------------
// Full deriveStatus integration – routing check
// ---------------------------------------------------------------------------

describe("deriveStatus – routing to type-specific handlers", () => {
  it("routes OPTIMISTIC proposals to optimistic handler", () => {
    const p = makeDaoNodeBase({
      voting_module_name: "optimistic",
      totals: { "no-param": { "0": "0" } },
      total_voting_power_at_start: "10000",
    });
    expect(deriveStatus(p, 0)).toBe("SUCCEEDED");
  });

  it("routes APPROVAL proposals to approval handler", () => {
    const p = makeDaoNodeBase({
      voting_module_name: "approval",
      totals: {
        "no-param": { "1": "1000", "0": "0", "2": "0" },
        "0": { "1": "500" },
      },
      quorum: "500",
      decoded_proposal_data: [
        [[[], [], [], null, "Option A"]],
        [1, 1, "", "0", "0"],
      ],
    });
    expect(deriveStatus(p, 0)).toBe("SUCCEEDED");
  });

  it("routes STANDARD proposals to standard handler", () => {
    const p = makeDaoNodeBase({
      voting_module_name: "standard",
      totals: { "no-param": { "1": "1000", "0": "0", "2": "0" } },
      quorum: "500",
      proposal_type_info: { approval_threshold: 5100, name: "basic" },
    });
    expect(deriveStatus(p, 0)).toBe("SUCCEEDED");
  });

  it("terminal state takes priority over vote-based routing", () => {
    // Even with a valid optimistic proposal, cancel_event wins
    const p = makeDaoNodeBase({
      voting_module_name: "optimistic",
      cancel_event: { blocktime: now - 100 },
      totals: { "no-param": { "0": "0" } },
      total_voting_power_at_start: "10000",
    });
    expect(deriveStatus(p, 0)).toBe("CANCELLED");
  });
});
