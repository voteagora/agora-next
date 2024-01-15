import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import styles from "@/styles/homepage.module.scss";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import { getProposals } from "./api/proposals/getProposals";
import { getMetrics } from "./api/metrics/getMetrics";
import { getVotableSupply } from "src/app/api/votableSupply/getVotableSupply";

async function fetchProposals(page = 1) {
  "use server";

  return getProposals({ page });
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
  const proposals = await fetchProposals();
  const metrics = await fetchDaoMetrics();
  const votableSupply = await fetchVotableSupply();

  return (
    <VStack className={styles.metrics_container}>
      <Hero />
      <DAOMetricsHeader metrics={metrics} />
      <PageDivider />
      <ProposalsList
        initialProposals={proposals}
        fetchProposals={fetchProposals}
        votableSupply={votableSupply}
      />
    </VStack>
  );
}
