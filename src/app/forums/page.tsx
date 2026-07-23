import type { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import ForumsPageContent from "./ForumsPageContent";

const tenant = Tenant.current();
const brandName = tenant.brandName || "Agora";
const copy = tenant.ui.copy;

// Force dynamic rendering - forum content changes frequently
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: copy.forums.metadataTitle(brandName),
  description: copy.forums.metadataDescription(brandName),
  alternates: {
    canonical: "/forums",
  },
  openGraph: {
    type: "website",
    title: copy.forums.metadataTitle(brandName),
    description: copy.forums.metadataOpenGraphDescription(brandName),
    url: "/forums",
    siteName: `${brandName} Forum`,
  },
  twitter: {
    card: "summary",
    title: copy.forums.metadataTitle(brandName),
    description: copy.forums.metadataTwitterDescription(brandName),
  },
};

export default async function ForumsPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("forums")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return <ForumsPageContent categoryId={null} categoryTitle={null} />;
}
