import React from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";

const ClaimStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="h-[800px] w-full bg-[url('/images/scroll/scroll-claim-bg.png')] bg-contain bg-center flex items-center justify-center">
      <div className="relative w-[600px]">
        <div className="bg-white rounded-2xl border border-agora-theme-100 p-6 shadow-newDefault relative">
          <h2 className="font-black text-2xl">Claim your allocation</h2>
          <p className="mt-2 text-agora-theme-700">
            You will be prompted to complete the claiming process from your
            connected wallet.
          </p>
          <div className="mt-6 h-48 w-full border border-dotted border-agora-theme-100 rounded-2xl bg-[url('/images/receipt_bg.svg')] bg-center relative flex items-center justify-center">
            <p className="font-semibold text-5xl">600</p>
          </div>
          <Button className="w-full mt-6" onClick={onSuccess}>
            Claim
          </Button>
        </div>
        <footer className="px-6 pb-6 pt-12 bg-agora-theme-50 border border-agora-theme-100 rounded-b-2xl z-10 mt-[-24px]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-agora-theme-700">
              Your voting power has been delegated
            </span>
            <div className="flex flex-row space-x-2 items-center mt-4">
              <span className="h-6 w-6 rounded-full bg-agora-theme-700"></span>
              <p>linda.eth</p>
              <span className="h-1 border-b border-dotted border-agora-theme-100 flex-1"></span>
              <span>est. 355</span>
            </div>
            <div className="flex flex-row space-x-2 items-center mt-4">
              <span className="h-6 w-6 rounded-full bg-agora-theme-700"></span>
              <p>linda.eth</p>
              <span className="h-1 border-b border-dotted border-agora-theme-100 flex-1"></span>
              <span>est. 355</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default ClaimStage;
