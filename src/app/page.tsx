import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import ProposalListContainer from "@/components/Proposals/ProposalsList/ProposalListContainer";
import DraftProposalList from "@/components/Proposals/ProposalsList/DraftProposalList";
import MyDraftProposalList from "@/components/Proposals/ProposalsList/MyDraftProposalList";
import AllProposalList from "@/components/Proposals/ProposalsList/AllProposalList";
import { Suspense } from "react";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";

// Revalidate cache every 60 seconds
export const revalidate = 60;

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export async function generateMetadata() {
  const { ui } = Tenant.current();

  const page = ui.page("proposals");
  const { title, description, imageTitle, imageDescription } = page!.meta;

  const preview = `/api/images/og/proposals?title=${encodeURIComponent(
    imageTitle
  )}&description=${encodeURIComponent(imageDescription)}`;

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

async function Home() {
  const { ui } = Tenant.current();

  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  const governanceCalendar = await fetchGovernanceCalendar();

  return (
    <div className="flex flex-col">
      <Hero />
      <Suspense fallback={<div>Loading...</div>}>
        {governanceCalendar && (
          <CurrentGovernanceStage
            title={governanceCalendar.title}
            endDate={governanceCalendar.endDate}
            reviewPeriod={governanceCalendar.reviewPeriod}
          />
        )}
        {/* TODO: needs my vote as filter to all proposals table? */}
        <ProposalListContainer
          allProposalsListElement={<AllProposalList />}
          draftProposalsListElement={<DraftProposalList />}
          myDraftProposalsListElement={<MyDraftProposalList />}
        />
      </Suspense>
    </div>
  );
}

export default Home;
