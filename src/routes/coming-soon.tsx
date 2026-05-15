/*
 * TanStack Start port of src/app/coming-soon/page.tsx.
 * URL: /coming-soon
 */

import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import Hero from "@/components/Hero/Hero";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import townsStaticProposals from "@/assets/tenant/towns_static_proposals.svg";
import syndicateStaticProposals from "@/assets/tenant/syndicate_static_proposals.svg";

export const Route = createFileRoute("/coming-soon")({
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `${brandName} Coming Soon` },
        {
          name: "description",
          content: `Stay up to date while ${brandName} governance launches on Agora.`,
        },
      ],
    };
  },
  loader: () => {
    const { ui, namespace } = Tenant.current();
    return {
      supportsNotifications: ui.toggle("email-subscriptions")?.enabled ?? false,
      showStaticProposals:
        ui.toggle("coming-soon/show-static-proposals")?.enabled ?? false,
      isTowns: namespace === TENANT_NAMESPACES.TOWNS,
    };
  },
  component: function ComingSoon() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;
    const { supportsNotifications, showStaticProposals, isTowns } = data;
    const proposalsImage = isTowns
      ? townsStaticProposals
      : syndicateStaticProposals;
    const overlayText = isTowns ? "Coming soon in January 2026" : "Coming Soon";

    return (
      <div className="flex flex-col">
        {supportsNotifications && <SubscribeDialogLauncher />}
        <Hero page="coming-soon" />
        <div className="flex flex-col max-w-[76rem]">
          <div className="hidden sm:flex flex-row justify-between items-baseline gap-2 mb-4">
            <h1 className="text-primary text-2xl font-extrabold mb-0">
              Proposals
            </h1>
          </div>
          {showStaticProposals && (
            <div className="relative">
              <img
                src={(proposalsImage as { src: string }).src}
                alt="Static proposals"
                className="w-full h-auto blur-sm opacity-60 block"
              />
              <img
                src={(proposalsImage as { src: string }).src}
                alt="Static proposals"
                className="w-full h-auto blur-sm opacity-60 block -mt-1 sm:hidden"
              />
              <img
                src={(proposalsImage as { src: string }).src}
                alt="Static proposals"
                className="w-full h-auto blur-sm opacity-60 block -mt-1 sm:hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-primary text-center text-base leading-6">
                  {overlayText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
