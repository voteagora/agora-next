import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import styles from "@/styles/homepage.module.scss";
import Hero from "@/components/Hero/Hero";
import { PageDivider } from "@/components/Layout/PageDivider";
import { VStack } from "@/components/Layout/Stack";
import { getProposals } from "./api/proposals/getProposals";
import { getMetrics } from "./api/metrics/getMetrics";
import { getVotableSupply } from "src/app/api/votableSupply/getVotableSupply";
import { getNeedsMyVoteProposals } from "./api/proposals/getNeedsMyVoteProposals";

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

export async function generateMetadata({}, parent) {
  const preview = `/api/images/og/proposals`;

  return {
    title: "Optimism Agora",
    description: "Home of token house governance and RPGF",
    openGraph: {
      images: [preview],
    },
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: preview,
    },
  };
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
