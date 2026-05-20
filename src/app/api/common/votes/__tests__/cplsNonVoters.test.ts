import { describe, expect, it } from "vitest";
import {
  buildCplsSnapshotNonVotersResult,
  CPLS_SNAPSHOT_VOTING_POWER_SOURCE,
} from "../cplsNonVoters";
import type { ArchiveNonVoterRow } from "@/lib/archiveUtils";

describe("buildCplsSnapshotNonVotersResult", () => {
  const rows: ArchiveNonVoterRow[] = [
    {
      addr: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      vp: "100000000000000000000",
    },
    {
      addr: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      vp: "149000000000000000000000",
      ens: "carlg.eth",
    },
    {
      addr: "0xcccccccccccccccccccccccccccccccccccccccc",
      vp: "103900000000000000000000",
    },
  ];

  it("sorts CPLS non-voters by snapshot VP descending", () => {
    const result = buildCplsSnapshotNonVotersResult({
      namespace: "demo",
      pagination: { offset: 0, limit: 20 },
      rows,
      sort: "weight",
      sortOrder: "desc",
      type: "TH",
    });

    expect(result.data.map((row) => row.delegate)).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);
    expect(result.data[0].voterMetadata?.name).toBe("carlg.eth");
    expect(result.data[0].votingPowerSource).toBe(
      CPLS_SNAPSHOT_VOTING_POWER_SOURCE
    );
  });

  it("sorts CPLS non-voters by snapshot VP ascending and paginates", () => {
    const result = buildCplsSnapshotNonVotersResult({
      namespace: "demo",
      pagination: { offset: 1, limit: 1 },
      rows,
      sort: "weight",
      sortOrder: "asc",
      type: "TH",
    });

    expect(result.data.map((row) => row.delegate)).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
    ]);
    expect(result.meta).toEqual({
      has_next: true,
      total_returned: 1,
      next_offset: 2,
    });
  });

  it("filters Optimism rows by voter type and deduplicates within each voter type", () => {
    const result = buildCplsSnapshotNonVotersResult({
      namespace: "optimism",
      pagination: { offset: 0, limit: 20 },
      rows: [
        ...rows,
        {
          addr: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          vp: "1",
        },
        {
          addr: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          vp: "1",
          citizen_type: "user",
          name: "Citizen User",
        },
        {
          addr: "0xdddddddddddddddddddddddddddddddddddddddd",
          vp: "1",
          citizen_type: "app",
        },
      ],
      sort: "weight",
      sortOrder: "desc",
      type: "USER",
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      delegate: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      citizen_type: "user",
      voterMetadata: {
        name: "Citizen User",
        image: "",
        type: "user",
      },
    });
  });

  it("uses deterministic delegate ordering for block_number sort", () => {
    const result = buildCplsSnapshotNonVotersResult({
      namespace: "demo",
      pagination: { offset: 0, limit: 20 },
      rows,
      sort: "block_number",
      sortOrder: "desc",
      type: "TH",
    });

    expect(result.data.map((row) => row.delegate)).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);
  });
});
