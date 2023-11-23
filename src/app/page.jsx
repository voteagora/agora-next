import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import styles from "@/styles/homepage.module.scss";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import { getProposals } from "./api/proposals/getProposals";

async function fetchProposals(page = 1) {
  "use server";

  const proposals = getProposals(page);
  return proposals;
}

async function fetchDaoMetrics() {
  "use server";

  try {
    const api = new AgoraAPI();
    const data = await api.get(`/metrics`);
    return data;
  } catch (error) {
    throw error;
  }
}

export default async function Home() {
  const proposals = await fetchProposals();
  const metrics = await fetchDaoMetrics();

  return (
    <VStack className={styles.metrics_container}>
      <Hero />
      <DAOMetricsHeader metrics={metrics} />
      <PageDivider />
      <ProposalsList
        initialProposals={proposals}
        fetchProposals={fetchProposals}
      />
    </VStack>
  );
}
