import { describe, it, expect } from "vitest";
import { makeDaoNodeBase, makeOodaoBase, now } from "./helpers";
import { deriveStatus } from "../deriveStatus";

// ---------------------------------------------------------------------------
// Terminal & time-based states (tested via deriveStatus)
// ---------------------------------------------------------------------------

describe("deriveStatus – terminal states", () => {
  it("returns CANCELLED when cancel_event is present", () => {
    const p = makeDaoNodeBase({ cancel_event: { blocktime: now - 100 } });
    expect(deriveStatus(p, 18)).toBe("CANCELLED");
  });

  it("returns CANCELLED when lifecycle_stage is CANCELLED", () => {
    const p = makeDaoNodeBase({ lifecycle_stage: "CANCELLED" });
    expect(deriveStatus(p, 18)).toBe("CANCELLED");
  });

  it("returns EXECUTED when execute_event is present", () => {
    const p = makeDaoNodeBase({ execute_event: { blocktime: now - 100 } });
    expect(deriveStatus(p, 18)).toBe("EXECUTED");
  });

  it("returns QUEUED when queue_event present (no execute)", () => {
    const p = makeDaoNodeBase({
      queue_event: { blocktime: now - 100, timestamp: now - 100 },
    });
    expect(deriveStatus(p, 18)).toBe("QUEUED");
  });

  it("returns PASSED when queued > 10 days ago and no onchain actions", () => {
    const tenDaysAgo = now - 10 * 24 * 60 * 60 - 1;
    const p = makeDaoNodeBase({
      queue_event: { timestamp: tenDaysAgo },
      calldatas: ["0x"],
    });
    expect(deriveStatus(p, 18)).toBe("PASSED");
  });

  it("returns QUEUED when queued > 10 days ago but has real calldatas", () => {
    const tenDaysAgo = now - 10 * 24 * 60 * 60 - 1;
    const p = makeDaoNodeBase({
      queue_event: { timestamp: tenDaysAgo },
      calldatas: ["0xdeadbeef"],
    });
    expect(deriveStatus(p, 18)).toBe("QUEUED");
  });

  it("returns CANCELLED when delete_event is present (eas-oodao)", () => {
    const p = makeOodaoBase({ delete_event: { blocktime: now - 100 } });
    expect(deriveStatus(p, 18)).toBe("CANCELLED");
  });
});

describe("deriveStatus – time-based states", () => {
  it("returns PENDING when voting has not started yet", () => {
    const p = makeDaoNodeBase({
      start_blocktime: now + 3600,
      end_blocktime: now + 7200,
    });
    expect(deriveStatus(p, 18)).toBe("PENDING");
  });

  it("returns ACTIVE when voting is in progress", () => {
    const p = makeDaoNodeBase({
      start_blocktime: now - 3600,
      end_blocktime: now + 7200,
    });
    expect(deriveStatus(p, 18)).toBe("ACTIVE");
  });
});

describe("deriveStatus – snapshot proposals", () => {
  it("returns CLOSED for closed snapshot proposal", () => {
    const p = {
      data_eng_properties: { source: "snapshot" },
      state: "closed",
    } as any;
    expect(deriveStatus(p, 18)).toBe("CLOSED");
  });

  it("returns ACTIVE for active snapshot proposal", () => {
    const p = {
      data_eng_properties: { source: "snapshot" },
      state: "active",
    } as any;
    expect(deriveStatus(p, 18)).toBe("ACTIVE");
  });

  it("returns PENDING for pending snapshot proposal", () => {
    const p = {
      data_eng_properties: { source: "snapshot" },
      state: "pending",
    } as any;
    expect(deriveStatus(p, 18)).toBe("PENDING");
  });
});
