import { getMetrics } from "@/app/api/common/metrics/getMetrics";
import { getNeedsMyVoteProposals } from "@/app/api/common/proposals/getNeedsMyVoteProposals";
import { getProposals } from "@/app/api/common/proposals/getProposals";
import { getVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { getGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchProposals(filter, page = 1) {
  "use server";
  return getProposals({ filter, page });
}

async function fetchNeedsMyVoteProposals(address) {
  "use server";
  return getNeedsMyVoteProposals(address);
}

async function fetchDaoMetrics() {
  "use server";
  return getMetrics();
}

async function fetchVotableSupply() {
  "use server";
  return getVotableSupply();
}

async function fetchGovernanceCalendar() {
  "use server";

  return getGovernanceCalendar();
}

export async function generateMetadata({}, parent) {
  const preview = `/api/images/og/proposals`;
  const title = "Optimism Agora";
  const description = "Home of token house governance and RPGF";

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
      <PageDivider />
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
