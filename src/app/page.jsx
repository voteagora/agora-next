import ProposalsList from "@/components/Proposals/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import { VStack } from "@/components/Layout/Stack";
import styles from "@/styles/homepage.module.scss";

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
      <h1 className="section_title">Proposal metrics</h1>
      <DAOMetricsHeader />
      {/* <ProposalsList
        initialProposals={proposals}
        fetchProposals={fetchProposals}
      /> */}
    </VStack>
  );
}
