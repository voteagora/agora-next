import { cache } from "react";

async function getRetroFundingRound(roundId: string) {
  const defaultEvents = [
    {
      status: "PLANNED",
      timestamp: "2024-01-01T00:00:00Z",
    },
    {
      status: "SCHEDULED",
      timestamp: "2024-02-01T00:00:00Z",
    },
    {
      status: "DONE",
      timestamp: "2024-03-01T00:00:00Z",
    },
  ];
  const defaultround = {
    roundId: 3,
    name: "RetroPGF Round Three",
    description: "The third retroactive funding round",
    externalLink: "https://vote.optimism.io/retropgf/3/summary",
    events: defaultEvents,
  };

  return defaultround;
}

export const fetchRetroFundingRounds = cache(getRetroFundingRound);
