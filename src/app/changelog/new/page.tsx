import ChangelogEntryForm from "@/components/Changelog/ChangelogEntryForm";
import Tenant from "@/lib/tenant/tenant";

export default async function Page() {
  const { ui } = Tenant.current();

  // TODO: Add changelog logic to the tenant
  // if (!ui.toggle("admin")) {
  //   return <div>Route not supported for namespace</div>;
  // }

  return <ChangelogEntryForm />;
}
