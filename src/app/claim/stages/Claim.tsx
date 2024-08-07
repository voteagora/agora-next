import React from "react";
import { Button } from "../../../components/ui/button";
import { useMerkleTree } from "@/hooks/useMerkleTree";

const ClaimStage = ({ onSuccess }: { onSuccess: () => void }) => {
  const { data } = useMerkleTree({
    // address: address!,
    address: "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
    tree: "scroll-test",
  });

  return (
    <main className="h-[800px] w-full bg-[url('/images/scroll/scroll-claim-bg.png')] bg-contain bg-center flex items-center justify-center">
      <div className="relative w-[600px]">
        <div className="bg-neutral rounded-2xl border border-line p-6 shadow-newDefault relative">
          <h2 className="font-black text-2xl">Claim your allocation</h2>
          <p className="mt-2 text-secondary">
            You will be prompted to complete the claiming process from your
            connected wallet.
          </p>
          <div className="mt-6 w-full border border-line rounded-2xl px-8 py-6">
            <div className="flex flex-row justify-between items-center">
              <p className="font-semibold text-5xl">{data?.value}</p>
              <span className="text-secondary text-right text-sm">
                Scroll available to claim
              </span>
            </div>
          </div>
          <Button
            variant="brandPrimary"
            className="w-full mt-6"
            onClick={onSuccess}
          >
            Claim tokens
          </Button>
        </div>
        <footer className="px-6 pb-6 pt-12 bg-wash border border-line rounded-b-2xl z-10 mt-[-24px]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-secondary">
              Your voting power has been delegated
            </span>
            <div className="flex flex-row space-x-2 items-center mt-4">
              <span className="h-6 w-6 rounded-full bg-tertiary"></span>
              <p className="text-primary">linda.eth</p>
              <span className="h-1 border-b border-dotted border-line flex-1"></span>
              <span className="text-primary">est. 355</span>
            </div>
            <div className="flex flex-row space-x-2 items-center mt-4">
              <span className="h-6 w-6 rounded-full bg-tertiary"></span>
              <p className="text-primary">linda.eth</p>
              <span className="h-1 border-b border-dotted border-line flex-1"></span>
              <span className="text-primary">est. 355</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default ClaimStage;
