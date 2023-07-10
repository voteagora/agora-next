import React, { Suspense } from "react";
import ENSName from "./ENSName"; // adjust the import path as per your project structure


function HumanAddress({ address }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ENSName address={address} />
    </Suspense>
  );
}

export default HumanAddress;
