import {
  CalculatorIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { HStack } from "../Layout/Stack";
import MetricContainer from "./MetricContainer";
import { formatNumber, tokens } from "@/lib/tokenUtils";
import { useMemo } from "react";

const stats = [
  {
    id: 1,
    name: "Voters / Noun Holders",
    subHeading: "311 / 394",
    icon: UserGroupIcon,
  },
  {
    id: 2,
    name: "Quorum floor",
    subHeading: "77 nouns (10% of supply)",
    icon: EnvelopeOpenIcon,
  },
  {
    id: 3,
    name: "Proposal threshold",
    subHeading: "2 nouns",
    icon: CalculatorIcon,
  },
  {
    id: 4,
    name: "Avg voter turnout",
    subHeading: "40%",
    icon: UserCircleIcon,
  },
];

export default function DAOMetricsHeader({ metrics }) {
  const formattedMetrics = useMemo(() => {
    return {
      votableSupply: formatNumber(metrics.votableSupply, "optimism", 4),
      totalSupply: formatNumber(metrics.totalSupply, "optimism", 4),
      quorum: formatNumber(metrics.quorum, "optimism", 4),
    };
  }, [metrics]);

  console.log(metrics);

  return (
    <HStack justifyContent="justify-between" gap={10}>
      <MetricContainer
        icon="community"
        title="Delegated / Total supply"
        body={
          <>
            {formattedMetrics.votableSupply} {tokens.optimism.symbol} /{" "}
            {formattedMetrics.totalSupply} {tokens.optimism.symbol}
          </>
        }
      />
      <MetricContainer
        icon="ballot"
        title="Quorum"
        body={
          <>
            {formattedMetrics.quorum} {tokens.optimism.symbol}
          </>
        }
      />
      <MetricContainer
        icon="pedestrian"
        title="Learn more"
        body={<>Operating Manual</>}
        link={
          "https://github.com/ethereum-optimism/OPerating-manual/blob/main/manual.md"
        }
      />
      <MetricContainer
        icon="pedestrian"
        title="Learn more"
        body={<>Governance Calendar</>}
        link={
          "https://calendar.google.com/calendar/u/0/r?cid=Y19mbm10Z3VoNm5vbzZxZ2JuaTJncGVyaWQ0a0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        }
      />
    </HStack>
  );
}
