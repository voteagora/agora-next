import {
  CalculatorIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { HStack } from "../Layout/Stack";
import * as theme from "@/styles/theme";
import { css } from "@emotion/css";
import MetricContainer from "./MetricContainer";
import { bpsToString } from "@/lib/utils";

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

export default function DAOMetricsHeader() {
  return (
    <HStack justifyContent="justify-between" gap={10}>
      <MetricContainer
        icon="ballot"
        title="Delegated / Total supply"
        body={<>79.79M OP / 4.295B OP</>}
      />
      <MetricContainer icon="ballot" title="Quorum" body={`24.09M OP`} />
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
