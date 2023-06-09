import { ArrowDownIcon, ArrowUpIcon, BookmarkSquareIcon, CalculatorIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/20/solid";
import {
  CursorArrowRaysIcon,
  EnvelopeOpenIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button"

const stats = [
  {
    id: 1,
    name: "Voters",
    subHeading: "71,897",
    icon: UserGroupIcon,
  },
  {
    id: 2,
    name: "Quroum",
    subHeading: "58.16%",
    icon: EnvelopeOpenIcon,
  },
  {
    id: 3,
    name: "Threshold",
    subHeading: "24.57%",
    icon: CalculatorIcon,
  },
  {
    id: 4,
    name: "Avg. Turnout",
    subHeading: "24.57%",
    icon: UserCircleIcon,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  return (
    <>
      <div>
        <h1 className="pageTitle">Stats</h1>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white p-4 shadow"
            >
              <dt>
                <div className="absolute rounded-md bg-gray-100 p-3">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-md font-semibold text-gray-900">
                  {item.subHeading}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <Button>Button</Button>
      </div>
    </>
  );
}
