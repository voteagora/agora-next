export const dynamic = "force-dynamic";

import CategoriesManager from "@/components/Admin/CategoriesManager";
import Tenant from "@/lib/tenant/tenant";
import { getForumCategories } from "@/lib/actions/forum";

export const revalidate = 0;

export default async function CategoriesPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("forum")) {
    return <div>Route not supported for namespace</div>;
  }

  const categoriesResult = await getForumCategories();
  const categories = categoriesResult.success
    ? categoriesResult.data.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        archived: category.archived,
        adminOnlyTopics: category.adminOnlyTopics,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }))
    : [];

  return <CategoriesManager initialCategories={categories} />;
}
