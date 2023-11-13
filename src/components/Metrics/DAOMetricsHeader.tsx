import {
  CalculatorIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { HStack, VStack } from "../Layout/Stack";
import styles from "./styles.module.scss";

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
    <div className={styles.dao_metric_container}>
      {stats.map((item) => (
        <div key={item.id} className={styles.dao_metric_card}>
          <HStack className="p-2" alignItems="items-center">
            <item.icon className="icon-class h-8" aria-hidden="true" />
            <div>
              <h4 className="text-class">{item.name}</h4>
              <h3 className="number-class">{item.subHeading}</h3>
            </div>
          </HStack>
        </div>
      ))}
    </div>
  );
}
