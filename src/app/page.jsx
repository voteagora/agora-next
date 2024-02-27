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
import { ProposalDraft } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import DraftProposalsList from "@/components/ProposalLifecycle/DraftProposalsList";

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

async function fetchDraftProposals(address) {
  "use server";

  const draftProposals = await prisma.proposalDraft.findMany({
    take: 3,
  });

  console.log(draftProposals);

  return draftProposals;
}

async function fetchDaoMetrics() {
  "use server";

  return getMetrics();
}

async function fetchVotableSupply() {
  "use server";

  return getVotableSupply();
}

async function createDraftProposal(address) {
  "use server";

  const proposal = await prisma.proposalDraft.create({
    data: {
      temp_check_link: "",
      proposal_type: "executable",
      title: "",
      description: "",
      abstract: "",
      audit_url: "",
      update_ens_docs_status: true,
      post_on_discourse_status: true,
      dao: "ens",
      proposal_status: "draft",
      author_address: address,
    },
  });

  return proposal;
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
    <VStack className={styles.metrics_container}>
      <Hero />
      <DAOMetricsHeader metrics={metrics} />
      <PageDivider />
      <DraftProposalsList fetchDraftProposals={fetchDraftProposals} />
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
        createDraftProposal={createDraftProposal}
      />
    </VStack>
  );
}
