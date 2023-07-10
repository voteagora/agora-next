import React, { Suspense } from "react";
import EnsName from "EnsName"; // adjust the import path as per your project structure

function HumanAddress({ address }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EnsName address={address} />
    </Suspense>
  );
}

export default HumanAddress;
