"use client";

import { useAccount } from "wagmi";
import React, { useState } from "react";
import TermsStage from "../stages/Terms";
import EligibilityStage from "../stages/Eligibility";
import ConstitutionStage from "../stages/Constitution";
import QuizStage from "../stages/Quiz";
import ValuesStage from "../stages/Values";
import DelegationStage from "../stages/Delegation";
import ClaimStage from "../stages/Claim";

const ClaimFlow = () => {
  const { address, isConnecting } = useAccount();
  const [stage, setStage] = useState<number>(1);
  const [values, setValues] = useState<string[]>([]);

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
      {/* helpers for testing... */}
      <div className="flex flex-row space-x-2">
        <button onClick={() => setStage(0)}>Terms</button>
        <button onClick={() => setStage(1)}>Eligibility</button>
        <button onClick={() => setStage(2)}>Quiz</button>
        <button onClick={() => setStage(3)}>Constitution</button>
        <button onClick={() => setStage(4)}>Values</button>
        <button onClick={() => setStage(5)}>Delegation</button>
        <button onClick={() => setStage(6)}>Claim</button>
      </div>
      {/* terms */}
      {stage === 0 && <TermsStage onSuccess={() => setStage(1)} />}
      {/* eligibility review */}
      {stage === 1 && <EligibilityStage onSuccess={() => setStage(2)} />}
      {/* quiz */}
      {stage === 2 && <QuizStage onSuccess={() => setStage(3)} />}
      {/* constitution */}
      {stage === 3 && <ConstitutionStage onSuccess={() => setStage(4)} />}
      {/* values */}
      {stage === 4 && (
        <ValuesStage
          onSuccess={() => setStage(5)}
          values={values}
          setValues={setValues}
        />
      )}
      {/* delegation */}
      {stage === 5 && <DelegationStage onSuccess={() => setStage(5)} />}
      {/* claim */}
      {stage === 6 && <ClaimStage onSuccess={() => setStage(0)} />}
    </div>
  );
};

export default ClaimFlow;
