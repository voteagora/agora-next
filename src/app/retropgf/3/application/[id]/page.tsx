import { getResultsProjectId } from "@/app/retropgf/actions";
import { redirect } from "next/navigation";
import RetroPGFApplicationBanner from "@/components/RetroPGF/RetroPGFApplicationBanner";
import RetroPGFApplicationContent from "@/components/RetroPGF/RetroPGFApplicationContent";
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
  params: { id },
}: {
  params: { id: string };
}) {
  const { ui } = Tenant.current();

  if (!ui.toggle("retropgf")) {
    return <div>Route not supported for namespace</div>;
  }

  const retroPGFProject = await getResultsProjectId(id);

  if (!retroPGFProject) {
    redirect("/retropgf/3");
  }

  return (
    <div className="mt-8">
      <RetroPGFApplicationBanner retroPGFProject={retroPGFProject} />
      <RetroPGFApplicationContent retroPGFProject={retroPGFProject} />
    </div>
  );
}
