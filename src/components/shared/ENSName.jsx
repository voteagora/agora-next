import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

function truncateAddress(address) {
  return `${address.substring(0, 4)}...${address.substring(
    address.length - 4
  )}`;
}

// This component will display the ENS name for a given address
const ENSName = ({ address }) => {
  const addy = address.split("-")[0];
  const truncatedAddress = truncateAddress(addy);
  const [ensName, setEnsName] = useState(truncatedAddress); // Initialize with the address as the ENS name
  const [attemptedLookup, setAttemptedLookup] = useState(false);

  useEffect(() => {
    const getEnsName = async () => {
      // Only attempt lookup if it hasn't been attempted before
      if (!attemptedLookup) {
        const provider = new ethers.AlchemyProvider(
          "mainnet",
          process.env.NEXT_PUBLIC_ALCHEMY_ID
        );

        const ensName = await provider.lookupAddress(addy);
        if (ensName) {
          setEnsName(ensName);
          setAttemptedLookup(true);
          return;
        } else {
          setEnsName(truncatedAddress);
          setAttemptedLookup(true);
          return;
        }
      }
    };

    getEnsName();
  }, [addy, truncatedAddress, attemptedLookup]);

  return <span>{ensName}</span>;
};

export default ENSName;
