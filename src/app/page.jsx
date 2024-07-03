import { fetchNeedsMyVoteProposals as apiFetchNeedsMyVoteProposals } from "@/app/api/common/proposals/getNeedsMyVoteProposals";
import {
  fetchProposals as apiFetchProposals,
  fetchDraftProposals as apiFetchDraftProposals,
  fetchDraftProposalForSponsor as apiFetchDraftProposalsForSponsorship,
} from "@/app/api/common/proposals/getProposals";
import { fetchVotableSupply as apiFetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import Hero from "@/components/Hero/Hero";
import { VStack } from "@/components/Layout/Stack";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import MyDraftProposals from "@/components/Proposals/DraftProposals/MyDraftProposals";
import MySponsorshipRequests from "@/components/Proposals/DraftProposals/MySponsorshipRequests";
import Image from "next/image";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchProposals(filter, page = 1) {
  "use server";
  return apiFetchProposals({ filter, page });
}

async function fetchNeedsMyVoteProposals(address) {
  "use server";
  return apiFetchNeedsMyVoteProposals(address);
}

async function fetchVotableSupply() {
  "use server";
  return apiFetchVotableSupply();
}

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export async function generateMetadata({}, parent) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("proposals");
  const { title, description } = page.meta;

  const preview = `/api/images/og/proposals?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home() {
  const tenant = Tenant.current();
  const governanceCalendar = await fetchGovernanceCalendar();
  const relevalntProposals = await fetchProposals(
    proposalsFilterOptions.relevant.filter
  );
  const allProposals = await fetchProposals(
    proposalsFilterOptions.everything.filter
  );

  const votableSupply = await fetchVotableSupply();

  return (
    <VStack>
      {tenant.namespace === "optimism" && (
        <a
          href="https://round4.optimism.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-[100px] w-full relative mt-12 block"
        >
          <Image
            src="/images/RetroPGF_Banner.png"
            alt="Retro banner"
            fill={true}
            className=" object-cover rounded-lg"
          />
        </a>
      )}
      <Hero />
      <MyDraftProposals
        fetchDraftProposals={async (address) => {
          "use server";
          return apiFetchDraftProposals(address);
        }}
      />
      <MySponsorshipRequests
        fetchDraftProposals={async (address) => {
          "use server";
          return apiFetchDraftProposalsForSponsorship(address);
        }}
      />
      <NeedsMyVoteProposalsList
        fetchNeedsMyVoteProposals={fetchNeedsMyVoteProposals}
        votableSupply={votableSupply}
      />
      <ProposalsList
        initRelevantProposals={relevalntProposals}
        initAllProposals={allProposals}
        fetchProposals={async (page, filter) => {
          "use server";
          return apiFetchProposals({ filter, page });
        }}
        governanceCalendar={governanceCalendar}
        votableSupply={votableSupply}
      />
    </VStack>
  );
}
