import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { VStack } from "@/components/Layout/Stack";
import styles from "@/styles/homepage.module.scss";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";

async function fetchProposals(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/proposals?page=${page}`);
  return { proposals: data.proposals, meta: data.meta };
}

export default async function Home() {
  const proposals = await fetchProposals();

  return (
    <VStack className={styles.metrics_container}>
      <Hero />
      <DAOMetricsHeader />
      <PageDivider />
      <ProposalsList
        initialProposals={proposals}
        fetchProposals={fetchProposals}
      />
    </VStack>
  );
}
