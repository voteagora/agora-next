// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import Tenant from "@/lib/tenant/tenant";
import ProposalsHome from "@/components/Proposals/ProposalsHome";
import ComingSoonPage from "@/app/coming-soon/page";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

// Revalidate cache every 60 seconds
export const revalidate = 60;

export async function generateMetadata() {
  const { ui } = Tenant.current();

  const page = ui.page("proposals");
  const { title, description, imageTitle, imageDescription } = page!.meta;

  const metadataBase = getMetadataBaseUrl();
  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    imageTitle
  )}&description=${encodeURIComponent(imageDescription)}`;

  return {
    metadataBase,
    title: title,
    description: description,
    openGraph: {
      type: "website",
      title: title,
      description: description,
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
          alt: title,
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
  const { ui } = Tenant.current();

  // Check if coming-soon is enabled
  const comingSoonEnabled = ui.toggle("coming-soon")?.enabled;

  if (comingSoonEnabled) {
    return <ComingSoonPage />;
  }

  return (
    <>
      <button
        id="qa-ab-fake-index-trigger"
        style={{
          position: "fixed",
          top: "150px",
          left: "50px",
          padding: "20px",
          background: "#ff0055",
          color: "white",
          fontWeight: "bold",
          zIndex: 9999,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(255,0,85,0.4)",
        }}
      >
        [QA] FAKE DRIFT TARGET (INDEX)
      </button>
      <ProposalsHome />
    </>
  );
}
