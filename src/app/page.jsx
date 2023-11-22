import ProposalsList from "../components/Proposals/ProposalsList/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";
import DAOMetricsHeader from "../components/Metrics/DAOMetricsHeader";
import styles from "../styles/homepage.module.scss";
import Hero from "../components/Hero/Hero";
import { PageDivider } from "../components/Layout/PageDivider";
import { VStack } from "../components/Layout/Stack";

async function fetchProposals(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/proposals?page=${page}`);
  return { proposals: data.proposals, meta: data.meta };
}

async function fetchDaoMetrics() {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/metrics`);
  return data;
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
