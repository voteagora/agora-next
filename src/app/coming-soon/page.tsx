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
  const overlayText = isTowns ? "Coming soon in January 2026" : "Coming soon";

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="coming-soon" />

      {/* Proposals Section */}
      <div className="flex flex-col max-w-[76rem]">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
          <h1 className="text-primary text-2xl font-extrabold mb-0">
            Proposals
          </h1>
          <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit items-center">
            <div className="relative text-primary">
              <div className="text-primary w-full sm:w-fit bg-neutral font-medium border-wash rounded-full py-2 px-4 flex items-center">
                Most votes
                <svg
                  className="h-4 w-4 ml-[2px] opacity-30"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
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
          )
        }
      </div>
    </div>
  );
}
