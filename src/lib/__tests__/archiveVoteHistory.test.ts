import { describe, expect, it, vi } from "vitest";
import {
  buildArchiveNonVotersResult,
  canArchiveVotesSortByTime,
  processArchiveNonVoters,
  processArchiveVotes,
  transformArchiveNonVoterRows,
  transformArchiveVoteRows,
  type ArchiveNonVoter,
  type ArchiveVote,
} from "../archiveVoteHistory";
import type { ArchiveNonVoterRow, ArchiveVoteRow } from "../archiveUtils";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME = "optimism";
  process.env.NEXT_PUBLIC_AGORA_ENV = "prod";
  process.env.NEXT_PUBLIC_RPC_SECRET = "test";
});

const makeNonVoter = (
  delegate: string,
  voting_power: string,
  citizen_type: string | null = null
): ArchiveNonVoter => ({
  delegate,
  voting_power,
  citizen_type,
  twitter: null,
  warpcast: null,
  discord: null,
  voterMetadata: null,
});

const makeVote = ({
  address,
  weight,
  blockNumber,
  citizenType = null,
  timestamp = null,
}: {
  address: string;
  weight: string;
  blockNumber: bigint | null;
  citizenType?: string | null;
  timestamp?: Date | null;
}): ArchiveVote => ({
  transactionHash: null,
  address,
  support: "FOR",
  weight,
  citizenType,
  voterMetadata: null,
  proposalId: "1",
  proposalType: "STANDARD",
  params: null,
  reason: null,
  blockNumber,
  timestamp,
});

describe("archive vote-history row transforms", () => {
  it("transforms archive vote rows with metadata, Copeland VP, params, and temporal fields", () => {
    const rows: ArchiveVoteRow[] = [
      {
        voter: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        support: "1",
        vp: "42",
        choice: [2, 1],
        block_number: "123",
        transaction_hash: "0xhash",
        ts: "1700000000000",
        ens: "alice.eth",
        image: "ipfs://avatar",
      },
    ];

    expect(
      transformArchiveVoteRows(rows, {
        parseSupport: (support) => (support === "1" ? "FOR" : "ABSTAIN"),
        proposalId: "7",
        proposalType: "SNAPSHOT",
        startBlock: 1n,
      })
    ).toEqual([
      expect.objectContaining({
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        blockNumber: 123n,
        params: [2, 1],
        proposalId: "7",
        support: "FOR",
        transactionHash: "0xhash",
        voterMetadata: {
          name: "alice.eth",
          image: "ipfs://avatar",
          type: "",
        },
        weight: "42",
      }),
    ]);
  });

  it("dedupes non-voter rows within each voter type and preserves optional voting power source", () => {
    const rows: ArchiveNonVoterRow[] = [
      {
        addr: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        vp: "100",
        ens: "alice.eth",
      },
      {
        addr: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        vp: "50",
        ens: "ignored.eth",
      },
      {
        addr: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        vp: "1",
        citizen_type: "USER",
        name: "Citizen Alice",
      },
    ];

    expect(
      transformArchiveNonVoterRows(rows, {
        votingPowerSource: "cpls_snapshot",
      })
    ).toEqual([
      {
        delegate: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        voting_power: "100",
        twitter: null,
        warpcast: null,
        discord: null,
        citizen_type: null,
        voterMetadata: {
          name: "alice.eth",
          image: "",
          type: "",
        },
        votingPowerSource: "cpls_snapshot",
      },
      {
        delegate: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        voting_power: "1",
        twitter: null,
        warpcast: null,
        discord: null,
        citizen_type: "USER",
        voterMetadata: {
          name: "Citizen Alice",
          image: "",
          type: "USER",
        },
        votingPowerSource: "cpls_snapshot",
      },
    ]);
  });
});

describe("processArchiveNonVoters", () => {
  it("sorts archive non-voters by snapshot VP descending and ascending", () => {
    const nonVoters = [
      makeNonVoter("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "100"),
      makeNonVoter(
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "9007199254740993001"
      ),
      makeNonVoter(
        "0xcccccccccccccccccccccccccccccccccccccccc",
        "9007199254740993000"
      ),
    ];

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "desc",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "asc",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
  });

  it("sorts non-voters by displayed VP across houses", () => {
    const nonVoters = [
      makeNonVoter("0xcccccccccccccccccccccccccccccccccccccccc", "1", "USER"),
      makeNonVoter(
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "100000000000000000000"
      ),
      makeNonVoter("0xdddddddddddddddddddddddddddddddddddddddd", "5", "APP"),
      makeNonVoter(
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "500000000000000000"
      ),
      makeNonVoter(
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "1000000000000000000"
      ),
    ];

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "desc",
        voterType: "ALL",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "asc",
        voterType: "ALL",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
  });

  it("filters archive non-voters by voter type", () => {
    const nonVoters = [
      makeNonVoter("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "100"),
      makeNonVoter("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "1", "USER"),
      makeNonVoter("0xcccccccccccccccccccccccccccccccccccccccc", "1", "APP"),
      makeNonVoter("0xdddddddddddddddddddddddddddddddddddddddd", "1", "CHAIN"),
    ];

    expect(
      processArchiveNonVoters(nonVoters, { voterType: "TH" }).map(
        (row) => row.delegate
      )
    ).toEqual(["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]);
    expect(
      processArchiveNonVoters(nonVoters, { voterType: "CH" }).map(
        (row) => row.delegate
      )
    ).toHaveLength(3);
    expect(
      processArchiveNonVoters(nonVoters, { voterType: "USER" }).map(
        (row) => row.delegate
      )
    ).toEqual(["0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"]);
  });

  it("uses deterministic delegate ordering for block number fallback", () => {
    const nonVoters = [
      makeNonVoter("0xcccccccccccccccccccccccccccccccccccccccc", "1"),
      makeNonVoter("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "3"),
      makeNonVoter("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "2"),
    ];

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "block_number",
        sortOrder: "asc",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xcccccccccccccccccccccccccccccccccccccccc",
    ]);
  });

  it("filters, sorts, and paginates before slicing rows", () => {
    const nonVoters = [
      makeNonVoter("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "1"),
      makeNonVoter("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "4", "USER"),
      makeNonVoter("0xcccccccccccccccccccccccccccccccccccccccc", "2", "USER"),
      makeNonVoter("0xdddddddddddddddddddddddddddddddddddddddd", "3", "APP"),
    ];

    expect(
      buildArchiveNonVotersResult({
        nonVoters,
        pagination: { offset: 1, limit: 1 },
        sort: "weight",
        sortOrder: "desc",
        voterType: "CH",
      })
    ).toEqual({
      meta: {
        has_next: true,
        total_returned: 1,
        next_offset: 2,
      },
      data: [
        makeNonVoter("0xdddddddddddddddddddddddddddddddddddddddd", "3", "APP"),
      ],
    });
  });
});

describe("processArchiveVotes", () => {
  it("sorts archive votes by weight and block number", () => {
    const votes = [
      makeVote({
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        weight: "100",
        blockNumber: 20n,
      }),
      makeVote({
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        weight: "300",
        blockNumber: 10n,
      }),
      makeVote({
        address: "0xcccccccccccccccccccccccccccccccccccccccc",
        weight: "200",
        blockNumber: 30n,
      }),
    ];

    expect(
      processArchiveVotes(votes, {
        sort: "weight",
        sortOrder: "desc",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);

    expect(
      processArchiveVotes(votes, {
        sort: "block_number",
        sortOrder: "desc",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
  });

  it("filters archive votes by voter type", () => {
    const votes = [
      makeVote({
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        weight: "100",
        blockNumber: 1n,
      }),
      makeVote({
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        weight: "1",
        blockNumber: 2n,
        citizenType: "USER",
      }),
    ];

    expect(
      processArchiveVotes(votes, { voterType: "TH" }).map(
        (vote) => vote.address
      )
    ).toEqual(["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]);
    expect(
      processArchiveVotes(votes, { voterType: "USER" }).map(
        (vote) => vote.address
      )
    ).toEqual(["0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"]);
  });

  it("sorts votes by displayed VP across houses", () => {
    const votes = [
      makeVote({
        address: "0xcccccccccccccccccccccccccccccccccccccccc",
        weight: "1",
        blockNumber: 3n,
        citizenType: "USER",
      }),
      makeVote({
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        weight: "100000000000000000000",
        blockNumber: 2n,
      }),
      makeVote({
        address: "0xdddddddddddddddddddddddddddddddddddddddd",
        weight: "5",
        blockNumber: 4n,
        citizenType: "APP",
      }),
      makeVote({
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        weight: "500000000000000000",
        blockNumber: 1n,
      }),
      makeVote({
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        weight: "1000000000000000000",
        blockNumber: 5n,
      }),
    ];

    expect(
      processArchiveVotes(votes, {
        sort: "weight",
        sortOrder: "desc",
        voterType: "ALL",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);

    expect(
      processArchiveVotes(votes, {
        sort: "weight",
        sortOrder: "asc",
        voterType: "ALL",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
  });

  it("sorts only temporal archive votes when some rows lack temporal data", () => {
    const votes = [
      makeVote({
        address: "0xcccccccccccccccccccccccccccccccccccccccc",
        weight: "1",
        blockNumber: null,
        citizenType: "USER",
      }),
      makeVote({
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        weight: "100",
        blockNumber: 20n,
      }),
      makeVote({
        address: "0xdddddddddddddddddddddddddddddddddddddddd",
        weight: "1",
        blockNumber: null,
        citizenType: "APP",
      }),
      makeVote({
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        weight: "1",
        blockNumber: 10n,
      }),
    ];

    expect(
      processArchiveVotes(votes, {
        sort: "block_number",
        sortOrder: "desc",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);

    expect(
      processArchiveVotes(votes, {
        sort: "block_number",
        sortOrder: "asc",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]);
  });

  it("allows time sorting when any active archive vote has temporal data", () => {
    expect(
      canArchiveVotesSortByTime([
        makeVote({
          address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          weight: "1",
          blockNumber: 1n,
        }),
        makeVote({
          address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          weight: "1",
          blockNumber: 2n,
        }),
      ])
    ).toBe(true);

    expect(
      canArchiveVotesSortByTime([
        makeVote({
          address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          weight: "1",
          blockNumber: null,
          timestamp: null,
        }),
        makeVote({
          address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          weight: "1",
          blockNumber: 2n,
        }),
      ])
    ).toBe(true);

    expect(
      canArchiveVotesSortByTime([
        makeVote({
          address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          weight: "1",
          blockNumber: null,
          timestamp: null,
        }),
      ])
    ).toBe(false);
  });
});
