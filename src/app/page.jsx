import { getDelegates } from "@/app/api/delegates/getDelegates";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";
import styles from "@/styles/homepage.module.scss";
import { getVotableSupply } from "src/app/api/votableSupply/getVotableSupply";
import { getMetrics } from "./api/metrics/getMetrics";
import { getNeedsMyVoteProposals } from "./api/proposals/getNeedsMyVoteProposals";
import { getProposals } from "./api/proposals/getProposals";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchProposals(filter, page) {
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

export default async function Home({ searchParams }) {

  const filter = proposalsFilterOptions[searchParams.filter]?.filter || proposalsFilterOptions.recent.filter;

  const proposals = await fetchProposals(filter);
  const metrics = await fetchDaoMetrics();
  const votableSupply = await fetchVotableSupply();

  return (
    <VStack className={styles.metrics_container}>
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
