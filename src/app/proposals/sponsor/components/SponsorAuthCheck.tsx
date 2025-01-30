"use client";

import { useAccount } from "wagmi";
import { useIsMounted } from "connectkit";
import AgoraLoader, {
  LogoLoader,
} from "@/components/shared/AgoraLoader/AgoraLoader";
import Tenant from "@/lib/tenant/tenant";

const SponsorAuthCheck = ({
  sponsorAddresses,
  children,
}: {
  sponsorAddresses: `0x${string}`[];
  children: React.ReactNode;
}) => {
  const { address, isConnecting } = useAccount();
  const isMounted = useIsMounted();
  const { ui } = Tenant.current();
  const shouldHideAgoraBranding = ui.hideAgoraBranding;

  if (!isMounted) {
    return shouldHideAgoraBranding ? <LogoLoader /> : <AgoraLoader />;
  }

  if (isConnecting) {
    return (
      <main className="max-w-screen-xl mx-auto mt-12">
        <div className="grid grid-cols-3 gap-12 animate-pulse">
          <div className="col-span-2 h-64 w-full bg-agora-stone-100"></div>
          <div className="self-start h-24 w-full bg-agora-stone-100"></div>
        </div>
      </main>
    );
  }
  if (!sponsorAddresses.includes(address as `0x${string}`)) {
    return (
      <main className="mx-auto mt-12 h-[calc(100vh-240px)] w-full flex flex-col justify-center items-center bg-tertiary/5 border border-line rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unauthorized</h1>
          <h3 className="">This is a private draft proposal.</h3>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default SponsorAuthCheck;
