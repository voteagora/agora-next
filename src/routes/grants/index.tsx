/*
 * TanStack Start port of src/app/grants/page.tsx.
 * URL: /grants
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import GrantsList from "@/app/grants/components/GrantsList";

export const Route = createFileRoute("/grants/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("grants")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `${brandName} Grants` },
        {
          name: "description",
          content: `Explore active grants and funding opportunities from ${brandName}.`,
        },
      ],
    };
  },
  component: function GrantsPage() {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col max-w-[76rem] mt-12 mb-0 sm:my-12">
          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-[1.15rem] sm:mb-[1.35rem]">
            <h1 className="text-primary text-2xl font-extrabold mb-0">
              Grants
            </h1>
          </div>
          <GrantsList />
        </div>
      </div>
    );
  },
});
