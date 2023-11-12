import {
  CalculatorIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { HStack, VStack } from "../layout/Stack";
import styles from "@/styles/components.module.scss";

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
    <div>
      <VStack gap="gap-3">
        <h1 className="pageTitle">DAO Metrics</h1>
        <HStack gap="gap-3">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.id} className={styles.card}>
                <dt>
                  <div className="absolute rounded-md bg-gray-100 p-3">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                  <p className="text-md text-gray-900">{item.subHeading}</p>
                </dd>
              </div>
            ))}
          </dl>
        </HStack>
      </VStack>
    </div>
  );
}
