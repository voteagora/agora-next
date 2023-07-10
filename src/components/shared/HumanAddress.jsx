import React, { Suspense } from "react";
import ENSName from "./ENSName"; // adjust the import path as per your project structure

// This component will display the ENS name for a given address
function HumanAddress({ address }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ENSName address={address} />
    </Suspense>
  );
}

export default HumanAddress;
