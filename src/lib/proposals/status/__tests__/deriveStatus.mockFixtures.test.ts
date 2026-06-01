import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import "./helpers";
import { deriveStatus } from "../deriveStatus";

const MOCK_ROOT = join(__dirname, "../../../../../tests/__mocks__");

/**
 * Expected final status for each mock fixture, keyed by proposal id.
 *
 * dao_node fixtures (synthetic 99…NNN ids + real archived proposals):
 *   001–005  – standard (defeated × 2, cancelled, queued, passed)
 *   006      – hybrid standard (defeated)
 *   007–009  – approval (defeated × 3)
 *   010      – hybrid approval (succeeded)
 *   011      – optimistic (defeated/vetoed)
 *   012      – hybrid optimistic tiered (defeated/vetoed)
 *   real ids – real archived proposals
 *
 * eas-atlas fixtures:
 *   013      – offchain optimistic (defeated/vetoed)
 *   014      – offchain standard (succeeded)
 *   015–016  – KNOWN_GAPS (eas-atlas quorum/threshold currently hardcoded 0)
 *   017      – offchain approval (succeeded)
 *   018–019  – offchain approval (defeated)
 *   020      – offchain optimistic tiered (succeeded)
 *   021      – offchain optimistic tiered (defeated)
 *   real id  – real archived optimistic proposal
 */
const EXPECTED: Record<string, string> = {
  // ──── Real archived proposals (dao_node) ────────────────────────────────
  "104658512477211447238723406913978051219515164565395855005009394415444207632959":
    "SUCCEEDED",
  "28197030874936103651584757576099649781961082558352101632047737121219887503363":
    "SUCCEEDED",
  "32872683835969469583703720873380428072981331285364097246290907925181946140808":
    "SUCCEEDED",
  "43611390841042156127733279917289923399354155784945103358272334363949369459237":
    "SUCCEEDED",
  "77379844029098348047245706083901850540159595802129942495264753179306805786028":
    "SUCCEEDED",
  "95125315478676153337636309965804486010918292377915044655013986825087199254978":
    "EXECUTED",

  // ──── Synthetic dao_node fixtures ────────────────────────────────────────
  "99000000000000000000000000000000000000000000000000000000000000000000000000001":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000002":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000003":
    "CANCELLED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000004":
    "QUEUED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000005":
    "PASSED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000006":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000007":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000008":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000009":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000010":
    "SUCCEEDED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000011":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000012":
    "DEFEATED",

  // ──── Real archived proposal (eas-atlas) ─────────────────────────────────
  "104254402796183118613790552174556993080165650973960750641671478192868760878324":
    "SUCCEEDED",

  // ──── Synthetic eas-atlas fixtures ───────────────────────────────────────
  "99000000000000000000000000000000000000000000000000000000000000000000000000013":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000014":
    "SUCCEEDED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000017":
    "SUCCEEDED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000018":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000019":
    "DEFEATED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000020":
    "SUCCEEDED",
  "99000000000000000000000000000000000000000000000000000000000000000000000000021":
    "DEFEATED",
};

/**
 * Fixtures where the current implementation intentionally diverges from the
 * "eventual" expected status (e.g. eas-atlas quorum/threshold is hardcoded 0).
 * These are tracked here to make the gap visible rather than silently skipped.
 */
const KNOWN_GAPS = new Set([
  // eas-atlas OFFCHAIN_STANDARD: quorum / approval-threshold currently hardcoded
  // to 0 for all eas-atlas proposals so both of these return SUCCEEDED instead of
  // DEFEATED. Remove from this set once resolveArchiveThresholds reads the real
  // thresholds for eas-atlas.
  "99000000000000000000000000000000000000000000000000000000000000000000000000015",
  "99000000000000000000000000000000000000000000000000000000000000000000000000016",
]);

function collect(dir: string) {
  return readdirSync(join(MOCK_ROOT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      id: f.replace(".json", ""),
      path: join(MOCK_ROOT, dir, f),
    }));
}

describe("deriveStatus – mock fixtures (dao_node + eas-atlas)", () => {
  const files = [...collect("dao_node"), ...collect("eas-atlas")];

  for (const { id, path } of files) {
    const expected = EXPECTED[id];
    if (!expected) continue;
    if (KNOWN_GAPS.has(id)) continue;

    it(`${id.slice(0, 4)}…${id.slice(-3)} → ${expected}`, () => {
      const proposal = JSON.parse(readFileSync(path, "utf8"));
      expect(deriveStatus(proposal, 18)).toBe(expected);
    });
  }
});

describe("KNOWN_GAPS – document implementation vs intended behaviour", () => {
  for (const id of KNOWN_GAPS) {
    const path = join(MOCK_ROOT, "eas-atlas", `${id}.json`);

    it(`${id.slice(0, 4)}…${id.slice(-3)} currently returns SUCCEEDED (gap: should be DEFEATED)`, () => {
      const proposal = JSON.parse(readFileSync(path, "utf8"));
      // Document the current (incorrect) behaviour so it fails loudly if it
      // ever changes unexpectedly in either direction.
      expect(deriveStatus(proposal, 18)).toBe("SUCCEEDED");
    });
  }
});
