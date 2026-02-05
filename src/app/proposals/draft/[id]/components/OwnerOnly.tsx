"use client";

import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

const OnlyOwner = ({
  ownerAddresses,
  children,
}: {
  ownerAddresses: string[];
  children: React.ReactNode;
}) => {
  const { address, isConnecting, isReconnecting } = useAccount();
  const searchParams = useSearchParams();
  const shareParam = searchParams?.get("share");
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const config = proposalLifecycleToggle?.config as PLMConfig;

  // causing jitter when loading... need to figure out a better long term solution
  //   if (isConnecting || isReconnecting) {
  //     return (
  //       <main className="max-w-screen-xl mx-auto mt-10">
  //         <div className="mb-4 flex flex-row items-center space-x-6">
  //           <h1 className="font-black text-primary text-2xl m-0">Loading...</h1>
  //         </div>
  //         <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6">
  //           <section className="col-span-1 sm:col-span-2 order-last sm:order-first h-36 bg-agora-stone-100 animate-pulse rounded-lg"></section>
  //           <section className="col-span-1 h-12 bg-agora-stone-100 animate-pulse rounded-lg"></section>
  //         </div>
  //       </main>
  //     );
  //   }

  // Check if sharing via author address - configurable per tenant
  if (
    config?.allowDraftSharing &&
    shareParam &&
    ownerAddresses.some(
      (owner) => owner.toLowerCase() === shareParam.toLowerCase()
    )
  ) {
    return <>{children}</>;
  }

  if (!ownerAddresses.includes(address as string)) {
    return (
      <div className="text-primary">
        You are not the owner of this proposal.
      </div>
    );
  }

  return <>{children}</>;
};

export default OnlyOwner;
