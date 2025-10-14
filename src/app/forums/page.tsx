import type { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import ForumsPageContent from "./ForumsPageContent";

const tenant = Tenant.current();
const brandName = tenant.brandName || "Agora";

// Force dynamic rendering - forum content changes frequently
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${brandName} Forum Discussions`,
  description: `Browse the latest topics, questions, and community updates from the ${brandName} forum.`,
  alternates: {
    canonical: "/forums",
  },
  openGraph: {
    type: "website",
    title: `${brandName} Forum Discussions`,
    description: `Join the ${brandName} community conversations and explore trending forum topics.`,
    url: "/forums",
    siteName: `${brandName} Forum`,
  },
  twitter: {
    card: "summary",
    title: `${brandName} Forum Discussions`,
    description: `Discover the latest conversations happening on the ${brandName} forum.`,
  },
};

export default async function ForumsPage() {
  return <ForumsPageContent categoryId={null} categoryTitle={null} />;
}
