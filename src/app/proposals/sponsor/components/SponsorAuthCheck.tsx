"use client";

import { useAccount } from "wagmi";

const SponsorAuthCheck = ({
  sponsorAddress,
  children,
}: {
  sponsorAddress: string;
  children: React.ReactNode;
}) => {
  const { address, isConnecting, isReconnecting } = useAccount();

  if (isConnecting || isReconnecting) {
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="grid grid-cols-3 gap-12 animate-pulse">
          <div className="col-span-2 h-64 w-full bg-agora-stone-100"></div>
          <div className="self-start h-24 w-full bg-agora-stone-100"></div>
        </div>
      </main>
    );
  }

  if (sponsorAddress !== address) {
    return (
      <main className="max-w-screen-xl mx-auto mt-10">
        <div className="bg-agora-stone-50 border border-agora-stone-100 p-8 rounded-lg text-center">
          <h1 className="text-2xl font-black">Unauthorized</h1>
          <h3 className="text-m font-black">
            Only the sponsor of the proposal or the author is able to view this
            draft.
          </h3>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default SponsorAuthCheck;
