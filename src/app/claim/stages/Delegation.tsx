import React from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";

const DelegationStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <h1 className="text-2xl font-black">blah</h1>
          <div className="flex flex-row space-x-4 mt-10">
            {/* TODO (mg) edit copy */}
            <p className="text-agora-stone-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Aliquam eu lectus dignissim, porta
              tortor nec.
            </p>
            <Image
              src="/images/scroll/scroll-eligibility.png"
              width={200}
              height={200}
              alt="People float in a field of colored cubes"
            />
          </div>

          <div className="mt-10">
            <div className="flex flex-row justify-between items-center">
              <h3 className="font-semibold">Eligiblity criteria</h3>
              <span className="font-semibold text-xs text-agora-stone-700">
                Learn more
              </span>
            </div>
            <div></div>
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <h1 className="text-2xl font-black">Your allocation</h1>
          <p className="text-agora-stone-700 mb-4">
            You are eligible for the airdrop
          </p>
          <div className="h-48 w-full border border-dotted border-agora-stone-100 rounded-2xl bg-[url('/images/receipt_bg.svg')] bg-center relative flex items-center justify-center">
            <p className="font-semibold text-5xl">fdasfds</p>
          </div>
          <div className="mt-10">
            <Button
              className="w-full"
              onClick={() => {
                onSuccess();
              }}
            >
              Begin claim process
            </Button>
          </div>
        </div>
        <div>dont forget FAQs</div>
      </section>
    </main>
  );
};

export default ValuesStage;
