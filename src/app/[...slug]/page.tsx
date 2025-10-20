/**
 * Catch-all dynamic route handler for database-driven pages
 * This allows admins to create custom pages at any route
 * Falls back to 404 if no page is found in the database
 */

import { notFound } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { getPageContent } from "@/lib/actions/pages";
import { BlockRenderer } from "@/components/Blocks/BlockRenderer";

export const dynamic = "force-dynamic";

interface DynamicPageProps {
  params: {
    slug: string[];
  };
  searchParams?: {
    preview?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: DynamicPageProps) {
  const { slug: daoSlug } = Tenant.current();
  const route = params.slug.join("/");
  const version = searchParams?.preview === "true" ? "draft" : "published";

  const dynamicPage = await getPageContent(daoSlug, route, version);

  if (!dynamicPage) {
    return {
      title: "Page Not Found",
    };
  }

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    dynamicPage.meta_title
  )}&description=${encodeURIComponent(dynamicPage.meta_description)}`;

  return {
    title: dynamicPage.meta_title,
    description: dynamicPage.meta_description,
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
      title: dynamicPage.meta_title,
      description: dynamicPage.meta_description,
    },
  };
}

export default async function DynamicPage({
  params,
  searchParams,
}: DynamicPageProps) {
  const { slug: daoSlug } = Tenant.current();
  const route = params.slug.join("/");
  const version = searchParams?.preview === "true" ? "draft" : "published";

  // Try to load page from database
  const dynamicPage = await getPageContent(daoSlug, route, version);

  // If no page found, return 404
  if (!dynamicPage || dynamicPage.blocks.length === 0) {
    notFound();
  }

  // Render the page with its blocks
  return (
    <div className="flex flex-col">
      {dynamicPage.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
