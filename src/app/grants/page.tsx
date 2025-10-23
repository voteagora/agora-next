import Tenant from "@/lib/tenant/tenant";
import GrantsList from "./components/GrantsList";

export const revalidate = 0;

export default async function GrantsPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("grants")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col max-w-[76rem] mt-12 mb-0 sm:my-12">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
          <h1 className="text-primary text-2xl font-extrabold mb-0">Grants</h1>
        </div>

        <GrantsList />
      </div>
    </div>
  );
}
