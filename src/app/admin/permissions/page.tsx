export const dynamic = "force-dynamic";

import ForumPermissionsManager from "@/components/Admin/ForumPermissionsManager";
import Tenant from "@/lib/tenant/tenant";
import {
  getForumAdmins,
  getForumPermissions,
  getForumCategories,
} from "@/lib/actions/forum";

export const revalidate = 0;

export default async function ForumPermissionsPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("forum") && !ui.toggle("duna")) {
    return <div>Route not supported for namespace</div>;
  }

  const [adminsResult, permissionsResult, categoriesResult] = await Promise.all(
    [getForumAdmins(), getForumPermissions(), getForumCategories()]
  );

  const admins = adminsResult.success ? adminsResult.data : [];
  const permissions = permissionsResult.success ? permissionsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <ForumPermissionsManager
      initialAdmins={admins}
      initialPermissions={permissions}
      categories={categories}
    />
  );
}
