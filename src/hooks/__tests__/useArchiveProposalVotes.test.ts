import { describe, expect, it, vi } from "vitest";
import {
  canArchiveVotesSortByTime,
  processArchiveNonVoters,
  processArchiveVotes,
  type ArchiveNonVoter,
  type ArchiveVote,
} from "../useArchiveProposalVotes";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME = "optimism";
  process.env.NEXT_PUBLIC_AGORA_ENV = "prod";
  process.env.NEXT_PUBLIC_ALCHEMY_ID = "test";
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

  it("orders houses by VP direction when sorting all non-voters by VP", () => {
    const nonVoters = [
      makeNonVoter("0xcccccccccccccccccccccccccccccccccccccccc", "1", "USER"),
      makeNonVoter("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "100"),
      makeNonVoter("0xdddddddddddddddddddddddddddddddddddddddd", "5", "APP"),
      makeNonVoter("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "1"),
    ];

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "desc",
        voterType: "ALL",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xcccccccccccccccccccccccccccccccccccccccc",
    ]);

    expect(
      processArchiveNonVoters(nonVoters, {
        sort: "weight",
        sortOrder: "asc",
        voterType: "ALL",
      }).map((row) => row.delegate)
    ).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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

  it("orders houses by VP direction when sorting all votes by VP", () => {
    const votes = [
      makeVote({
        address: "0xcccccccccccccccccccccccccccccccccccccccc",
        weight: "1",
        blockNumber: 3n,
        citizenType: "USER",
      }),
      makeVote({
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        weight: "100",
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
        weight: "1",
        blockNumber: 1n,
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
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xcccccccccccccccccccccccccccccccccccccccc",
    ]);

    expect(
      processArchiveVotes(votes, {
        sort: "weight",
        sortOrder: "asc",
        voterType: "ALL",
      }).map((vote) => vote.address)
    ).toEqual([
      "0xcccccccccccccccccccccccccccccccccccccccc",
      "0xdddddddddddddddddddddddddddddddddddddddd",
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
