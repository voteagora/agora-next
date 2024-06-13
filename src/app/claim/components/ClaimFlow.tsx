"use client";

import { useAccount } from "wagmi";
import React, { useState } from "react";
import StartStage from "../stages/Start";
import TermsStage from "../stages/Terms";
import EligibilityStage from "../stages/Eligibility";
import ConstitutionStage from "../stages/Constitution";
import QuizStage from "../stages/Quiz";
import ValuesStage from "../stages/Values";
import DelegationStage from "../stages/Delegation";
import ClaimStage from "../stages/Claim";

const ClaimFlow = () => {
  const { address, isConnecting } = useAccount();
  const [stage, setStage] = useState<number>(0);
  const [values, setValues] = useState<string[]>([]);

  // loading case
  if (isConnecting) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* helpers for testing... */}
      <div className="flex flex-row space-x-2">
        <button onClick={() => setStage(0)}>Start</button>
        <button onClick={() => setStage(1)}>Terms</button>
        <button onClick={() => setStage(2)}>Eligibility</button>
        <button onClick={() => setStage(3)}>Quiz</button>
        <button onClick={() => setStage(4)}>Constitution</button>
        <button onClick={() => setStage(5)}>Values</button>
        <button onClick={() => setStage(6)}>Delegation</button>
        <button onClick={() => setStage(7)}>Claim</button>
      </div>
      {/* start */}
      {stage === 0 && <StartStage onSuccess={() => setStage(1)} />}
      {/* terms */}
      {stage === 1 && <TermsStage onSuccess={() => setStage(2)} />}
      {/* eligibility review */}
      {stage === 2 && <EligibilityStage onSuccess={() => setStage(3)} />}
      {/* quiz */}
      {stage === 3 && <QuizStage onSuccess={() => setStage(4)} />}
      {/* constitution */}
      {stage === 4 && <ConstitutionStage onSuccess={() => setStage(5)} />}
      {/* values */}
      {stage === 5 && (
        <ValuesStage
          onSuccess={() => setStage(6)}
          values={values}
          setValues={setValues}
        />
      )}
      {/* delegation */}
      {stage === 6 && (
        <DelegationStage
          onSuccess={() => setStage(7)}
          values={values}
          setValues={setValues}
        />
      )}
      {/* claim */}
      {stage === 7 && <ClaimStage onSuccess={() => setStage(0)} />}
    </div>
  );
};

export default ClaimFlow;
