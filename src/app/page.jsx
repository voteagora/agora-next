import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import { fetchNeedsMyVoteProposals as apiFetchNeedsMyVoteProposals } from "@/app/api/common/proposals/getNeedsMyVoteProposals";
import { fetchProposals as apiFetchProposals } from "@/app/api/common/proposals/getProposals";
import { fetchVotableSupply as apiFetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import Hero from "@/components/Hero/Hero";
import { VStack } from "@/components/Layout/Stack";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions, TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchProposals(filter, page = 1) {
  "use server";
  return apiFetchProposals({filter, page});
}

async function fetchNeedsMyVoteProposals(address) {
  "use server";
  return apiFetchNeedsMyVoteProposals(address);
}

async function fetchDaoMetrics() {
  "use server";
  return fetchMetrics();
}

async function fetchVotableSupply() {
  "use server";
  return apiFetchVotableSupply();
}

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export async function generateMetadata({}, parent) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("proposals");
  const { title, description } = page.meta;

  const preview = `/api/images/og/proposals?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: preview,
    },
    other: {
      ["twitter:card"]: "summary_large_image",
      ["twitter:title"]: title,
      ["twitter:description"]: description,
      ["twitter:image"]: preview,
    },
  };
}

export default async function Home() {
  // NOTE: This is a temporary placeholder for Ether.fi
  const { namespace } = Tenant.current();
  if (namespace === TENANT_NAMESPACES.ETHERFI) {
    return (
      <div>
        <Hero />
        <div>
          <div className="flex gap-6">
            <div className="bg-gradient-to-b from-stone-300 to-white  w-[1px] relative top-2"></div>
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <div className="text-sm text-indigo-800 font-medium">
                  Live – ETHFI token launch
                </div>
                <div>
                  <div className="w-[13px] h-[13px] rounded-full bg-indigo-800 relative -left-[31px] border-4 -top-4"></div>
                  On March 18th, we’re launching the $ETHFI token and taking the
                  first step towards full decentralization.
                </div>
              </div>
              <div>
                <div className="text-sm text-stone-600 font-medium">
                  Phase 1 – Governance initiation
                </div>
                <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                <div>
                  Over the next weeks, we will be gradually bringing voters into
                  Ether.fi’s governance by launching offchain voting on
                  Snapshot, delegate elections, our security council, and
                  discourse groups.
                </div>
              </div>
              <div>
                <div className="text-sm text-stone-600 font-medium">
                  Phase 2 – Transition to onchain governance
                </div>
                <div>
                  <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                  As the community grows over the next months, we will be fully
                  deploying the Agora onchain governor, and granting the
                  community access control to Ether.fi’s protocol and treasury.
                  This is allow Ether.fi’s team and the community to fully
                  collaborate in steering the protocol.
                </div>
              </div>
              <div>
                <div className="text-sm text-stone-600 font-medium">
                  Phase 3 – Full Ossification
                </div>
                <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                <div>
                  In the long run, we’ll work on fully automating and ossifying
                  governance function so that Ether.fi can stand the test of
                  time and last as an immutable protocol underpinning Ethereum’s
                  staking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const governanceCalendar = await fetchGovernanceCalendar();
  const relevalntProposals = await fetchProposals(
    proposalsFilterOptions.relevant.filter
  );
  const allProposals = await fetchProposals(
    proposalsFilterOptions.everything.filter
  );

  const metrics = await fetchDaoMetrics();
  const votableSupply = await fetchVotableSupply();

  return (
    <VStack>
      <Hero />
      <DAOMetricsHeader metrics={metrics} />
      <NeedsMyVoteProposalsList
        fetchNeedsMyVoteProposals={fetchNeedsMyVoteProposals}
        votableSupply={votableSupply}
      />
      <ProposalsList
        initRelevantProposals={relevalntProposals}
        initAllProposals={allProposals}
        fetchProposals={async (page, filter) => {
          "use server";
          return getProposals({ filter, page });
        }}
        governanceCalendar={governanceCalendar}
        votableSupply={votableSupply}
      />
    </VStack>
  );
}
