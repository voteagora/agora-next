"use client";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import { Button } from "@/components/Button";
import ClaimQuiz from "./ClaimQuiz";

const ClaimFlow = () => {
  const { address, isConnecting } = useAccount();
  const [stage, setStage] = useState<number>(1);

  // loading case
  if (isConnecting) {
    return <div>Loading...</div>;
  }

  // not connected case
  if (!address) {
    return (
      <main className="grid grid-cols-8 gap-10 mt-12">
        <section className="col-span-5">
          <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
            govern the scroll protocol
          </div>
        </section>
        <section className="col-span-3">
          <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
            <button>connect</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div>
      {/* eligibility review */}
      {stage === 1 && (
        <main className="grid grid-cols-8 gap-10 mt-12">
          <section className="col-span-5">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              congrats, you qualify
            </div>
          </section>
          <section className="col-span-3">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              your allocation
              <Button
                onClick={() => {
                  setStage(2);
                }}
              >
                Next
              </Button>
            </div>
          </section>
        </main>
      )}
      {/* quiz */}
      {stage === 2 && (
        <main className="grid grid-cols-8 gap-10 mt-12">
          <section className="col-span-5">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              scrolls vision and values
            </div>
          </section>
          <section className="col-span-3">
            <ClaimQuiz
              onSuccess={() => {
                setStage(3);
              }}
            />
          </section>
        </main>
      )}
      {/* constitution */}
      {stage === 3 && (
        <main className="grid grid-cols-8 gap-10 mt-12">
          <section className="col-span-5">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4"></div>
          </section>
          <section className="col-span-3">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              <h2 className="font-black text-2xl">Review the constitution</h2>
              <Button
                onClick={() => {
                  setStage(4);
                }}
              >
                Next
              </Button>
            </div>
          </section>
        </main>
      )}
      {/* delegation */}
      {stage === 4 && (
        <main className="grid grid-cols-8 gap-10 mt-12">
          <section className="col-span-5">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4"></div>
          </section>
          <section className="col-span-3">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              <h2 className="font-black text-2xl">Your delegates</h2>
              <Button
                onClick={() => {
                  setStage(5);
                }}
              >
                Next
              </Button>
            </div>
          </section>
        </main>
      )}
      {/* claim */}
      {stage === 5 && (
        <main className="grid grid-cols-8 gap-10 mt-12">
          <section className="col-span-5">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4"></div>
          </section>
          <section className="col-span-3">
            <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
              <h2 className="font-black text-2xl">Claim</h2>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default ClaimFlow;
