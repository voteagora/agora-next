import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ForumsPageContent from "../../../ForumsPageContent";
import Tenant from "@/lib/tenant/tenant";
import { buildForumCategoryPath } from "@/lib/forumUtils";
import { getForumCategory } from "@/lib/actions/forum/categories";

const tenant = Tenant.current();
const brandName = tenant.brandName || "Agora";

// Force dynamic rendering - forum content changes frequently
export const dynamic = "force-dynamic";

interface CategoryPageParams {
  categoryId: string;
  categoryTitle?: string[];
}

function parseCategoryId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.abs(Math.trunc(parsed));
}

async function loadCategory(categoryIdParam: string) {
  const id = parseCategoryId(categoryIdParam);
  if (id == null) {
    return null;
  }

  const response = await getForumCategory(id);
  if (!response?.success || !response.data) {
    return null;
  }

  return {
    id,
    name: response.data.name || null,
    description: response.data.description || null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: CategoryPageParams;
}): Promise<Metadata> {
  const categoryBundle = await loadCategory(params.categoryId);
  if (!categoryBundle) {
    return {};
  }

  const { id, name } = categoryBundle;
  const pageTitle = name
    ? `${brandName} Forum – ${name}`
    : `${brandName} Forum Discussions`;
  const canonical = buildForumCategoryPath(id, name || undefined);

  return {
    title: pageTitle,
    description: `Explore discussions in the ${name || "selected"} forum category for ${brandName}.`,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title: pageTitle,
      description: `Join the ${brandName} community conversations in ${name || "this"} forum category.`,
      url: canonical,
      siteName: `${brandName} Forum`,
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description: `Discover the latest conversations in ${name || "this"} forum category on the ${brandName} forum.`,
    },
  };
}

export default async function ForumsCategoryPage({
  params,
}: {
  params: CategoryPageParams;
}) {
  const categoryBundle = await loadCategory(params.categoryId);
  if (!categoryBundle) {
    return notFound();
  }

  return (
    <ForumsPageContent
      categoryId={categoryBundle.id}
      categoryTitle={categoryBundle.name}
      description={categoryBundle.description}
    />
  );
}
