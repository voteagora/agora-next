import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";
import { getVotableSupply } from "src/app/api/votableSupply/getVotableSupply";
import { getMetrics } from "./api/metrics/getMetrics";
import { getNeedsMyVoteProposals } from "./api/proposals/getNeedsMyVoteProposals";
import { getProposals } from "./api/proposals/getProposals";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchProposals(filter, page = 1) {
  "use server";
  return getProposals({ filter, page });
}

async function fetchNeedsMyVoteProposals(address) {
  "use server";

  return getNeedsMyVoteProposals({ address });
}

async function fetchDaoMetrics() {
  "use server";

  return getMetrics();
}

async function fetchVotableSupply() {
  "use server";

  return getVotableSupply();
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

export default async function Home({ searchParams }) {
  const filter = searchParams?.filter
    ? proposalsFilterOptions.everything.filter
    : proposalsFilterOptions.relevant.filter;
  const proposals = await fetchProposals(filter);

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
        initialProposals={proposals}
        fetchProposals={async (page) => {
          "use server";
          return getProposals({ filter, page });
        }}
        votableSupply={votableSupply}
      />
    </VStack>
  );
}
