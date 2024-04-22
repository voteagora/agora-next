import { cache } from "react";

async function getBallotsApi(roundId: string) {
  const defaultPaginationMetadata = {
    hasNext: false,
    totalReturned: 1,
    nextOffset: 1,
  };

  const defaultBallots = {
    ballots: [
      {
        address: "0x",
        ballotId: 0,
        roundId: roundId,
        status: "PENDING",
        allocations: [
          {
            metricId: 0,
            allocation: "0",
          },
        ],
        submitterAddress: "0xDa6d1F091B672C0f9e215eB9fa6B5a84bF2c5e11",
      },
    ],
  };

  return {
    metadata: defaultPaginationMetadata,
    ballots: [defaultBallots],
  };
}

async function getBallotApi(roundId: string, ballotCasterAddressOrEns: string) {
  const defaultBallot = {
    address: ballotCasterAddressOrEns,
    ballotId: 0,
    roundId: roundId,
    status: "PENDING",
    allocations: [
      {
        metricId: 0,
        allocation: "0",
      },
    ],
    submitterAddress: "0xDa6d1F091B672C0f9e215eB9fa6B5a84bF2c5e11",
  };

  return defaultBallot;
}

export const fetchBallots = cache(getBallotsApi);
export const fetchBallot = cache(getBallotApi);
