import Tenant from "@/lib/tenant/tenant";
import ProposalsHome from "@/components/Proposals/ProposalsHome";

// Revalidate cache every 60 seconds
export const revalidate = 60;

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

<<<<<<< HEAD
export default async function Home() {
  return <ProposalsHome />;
=======
async function Home() {
  const { ui } = Tenant.current();

  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;
  const governanceCalendar = await fetchGovernanceCalendar();

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero />
      <Suspense fallback={<div>Loading...</div>}>
        {/* TODO: needs my vote as filter to all proposals table? */}
        <ProposalListContainer
          allProposalsListElement={<AllProposalList />}
          draftProposalsListElement={<DraftProposalList />}
          myDraftProposalsListElement={<MyDraftProposalList />}
          governanceCalendar={governanceCalendar}
        />
      </Suspense>
    </div>
  );
>>>>>>> 7bde5615 (Fixes cal issue)
}
