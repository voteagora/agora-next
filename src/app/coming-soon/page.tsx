import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import townsStaticProposals from "@/assets/tenant/towns_static_proposals.svg";
import syndicateStaticProposals from "@/assets/tenant/syndicate_static_proposals.svg";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default async function ComingSoonPage() {
  const { ui, namespace } = Tenant.current();

  if (!ui.toggle("coming-soon")) {
    return <div>Route not supported for namespace</div>;
  }

  // Choose asset and text based on current tenant namespace
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;
  const proposalsImage = isTowns
    ? townsStaticProposals
    : syndicateStaticProposals;
  const overlayText = isTowns ? "Coming soon in January 2026" : "Coming Soon";

  return (
    <div className="flex flex-col">
      <Hero page="coming-soon" />

      {/* Proposals Section */}
      <div className="flex flex-col max-w-[76rem]">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
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
