"use client";

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

// This component will display the ENS name for a given address
const ENSName = ({ address }) => {
  const addy = address.split("-")[0];
  const [ensName, setEnsName] = useState(addy); // Initialize with the address as the ENS name

  useEffect(() => {
    const getEnsName = async () => {
      const provider = new ethers.AlchemyProvider(
        "mainnet",
        process.env.NEXT_PUBLIC_ALCHEMY_ID
      );

      try {
        const name = await provider.lookupAddress(addy);
        setEnsName(name);
      } catch (error) {
        console.error(`Failed to get ENS name for address ${addy}:`, error);
      }
    };

    getEnsName();
  }, [addy]);

  return <span>{ensName}</span>;
};

export default ENSName;
