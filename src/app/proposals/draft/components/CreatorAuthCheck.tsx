"use client";

import { useAccount } from "wagmi";

const CreatorAuthCheck = ({
  creatorAddress,
  children,
}: {
  creatorAddress: string;
  children: React.ReactNode;
}) => {
  const { address, isConnecting, isReconnecting } = useAccount();

  if (isConnecting || isReconnecting) {
    return (
      <main className="max-w-screen-xl mx-auto mt-12">
        <div className="grid grid-cols-3 gap-12 animate-pulse">
          <div className="col-span-2 h-64 w-full bg-wash"></div>
          <div className="self-start h-24 w-full bg-wash"></div>
        </div>
      </main>
    );
  }

  if (creatorAddress !== address) {
    return (
      <main className="max-w-screen-xl mx-auto mt-12">
        <div className="bg-wash border border-line p-8 rounded-lg text-center">
          <h1 className="text-2xl font-black text-primary">Unauthorized</h1>
          <h3 className="text-m font-black text-secondary">
            Only the author of the proposal is able to view this draft.
          </h3>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default CreatorAuthCheck;
