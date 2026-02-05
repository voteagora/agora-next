import RetroPGFResults from "@/components/RetroPGF/RetroPGFResults";
import RetroPGFHero from "@/components/RetroPGF/RetroPGFHero";
import RetroPGFFilters from "@/components/RetroPGF/RetroPGFFilters";
import { getRetroPGFResults } from "@/app/retropgf/actions";
import { retroPGFCategories, retroPGFSort } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export async function generateMetadata() {
  const title = "Agora - Optimism's RetroPGF Round 3 Summary";
  const description =
    "See which of your favourite projects were allocated in Optimism's RetroPGF Round 3.";

  const preview = `/api/images/og/proposals?title=${encodeURIComponent(
    "Optimism Agora"
  )}&description=${encodeURIComponent("Home of Optimism governance")}`;

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

export default async function Page({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: keyof typeof retroPGFCategories;
    orderBy?: keyof typeof retroPGFSort;
  };
}) {
  const { ui } = Tenant.current();

  if (!ui.toggle("retropgf")) {
    return <div>Route not supported for namespace</div>;
  }

  const projects = await getRetroPGFResults({
    search: searchParams.search || "",
    category: searchParams.category || null,
    orderBy: searchParams.orderBy || "mostAwarded",
  }).catch((error) => console.error("error", error));

  return (
    <>
      <RetroPGFHero />
      <RetroPGFFilters />
      <RetroPGFResults
        initialResults={projects.edges}
        initialPageInfo={projects.pageInfo}
      />
    </>
  );
}
