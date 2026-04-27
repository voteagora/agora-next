import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import townsStaticProposals from "@/assets/tenant/towns_static_proposals.svg";
import syndicateStaticProposals from "@/assets/tenant/syndicate_static_proposals.svg";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default async function ComingSoonPage() {
  const { ui, namespace } = Tenant.current();

  if (!ui.toggle("coming-soon")) {
    return <div>Route not supported for namespace</div>;
  }

  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;
  // Choose asset and text based on current tenant namespace
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;
  const proposalsImage = isTowns
    ? townsStaticProposals
    : syndicateStaticProposals;
  const overlayText = isTowns ? "Coming soon in January 2026" : "Coming Soon";

  // Get page data for mobile hero
  const pageData = ui.page("coming-soon");
  const mobileTitle = pageData?.title || "Proposals";
  const mobileDescription =
    pageData?.description || "Governance proposals are coming soon.";

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="coming-soon" />

      {/* Mobile Hero - shown only on mobile since Hero component is hidden */}
      <div className="flex flex-col mt-6 mb-8 sm:hidden">
        <h1 className="font-extrabold text-xl mb-2 text-primary">
          {mobileTitle}
        </h1>
        {mobileDescription && (
          <p className="text-secondary text-sm">{mobileDescription}</p>
        )}
      </div>

      {/* Proposals Section */}
      <div className="flex flex-col max-w-[76rem]">
        {/* Desktop section header - hidden on mobile where the mobile hero shows instead */}
        <div className="hidden sm:flex flex-row justify-between items-baseline gap-2 mb-4">
          <h1 className="text-primary text-2xl font-extrabold mb-0">
            Proposals
          </h1>
        </div>

        {ui.toggle("coming-soon/show-static-proposals")?.enabled && (
          <div className="relative">
            <img
              src={proposalsImage.src}
              alt="Static proposals"
              className="w-full h-auto blur-sm opacity-60 block"
            />
            <img
              src={proposalsImage.src}
              alt="Static proposals"
              className="w-full h-auto blur-sm opacity-60 block -mt-1 sm:hidden"
            />
            <img
              src={proposalsImage.src}
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
}
