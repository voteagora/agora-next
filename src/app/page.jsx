import {
  CalculatorIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import ProposalsList from "@/components/Proposals/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";

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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

async function fetchProposals(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/proposals?page=${page}`);
  return { proposals: data.proposals, meta: data.meta };
}

export default async function Home() {
  const proposals = await fetchProposals();

  return (
    <>
      <div>
        <h1 className="pageTitle">DAO Metrics</h1>

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
                <p className="text-md text-gray-900">{item.subHeading}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <section className="mt-10">
        <h1 className="pageTitle">Proposals</h1>
        <ProposalsList
          initialProposals={proposals}
          fetchProposals={fetchProposals}
        />
      </section>
    </>
  );
}
