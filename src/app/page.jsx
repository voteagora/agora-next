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

async function fetchProposals(page = 1) {
  "use server";

  return getProposals({ page });
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

export default async function Home() {

  const sort = proposalsFilterOptions[searchParams.orderBy]?.sort || proposalsFilterOptions.recent.sort;
  // TODO: impelment
  const proposals = await fetchProposals();
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
          fetchProposals={fetchProposals}
          votableSupply={votableSupply}
        />
    </VStack>
);
}
