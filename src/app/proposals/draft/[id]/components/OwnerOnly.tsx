"use client";

import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import { LockClosedIcon } from "@heroicons/react/24/outline";

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

  // While the wallet/account state is resolving, show a centered loader to avoid a brief unauthorized flash
  if (isConnecting || isReconnecting) {
    return <AgoraLoader />;
  }

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center text-center gap-3 p-6 border border-line rounded-lg bg-neutral max-w-md">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-tertiary/20">
            <LockClosedIcon className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-primary">Access restricted</h2>
          <p className="text-secondary text-sm">
            You are not the owner of this draft. Switch to the author account or
            request access to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OnlyOwner;
