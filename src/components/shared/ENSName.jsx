import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

// This component will display the ENS name for a given address
const ENSName = ({ address }) => {
  const [ensName, setEnsName] = useState(address); // Initialize with the address as the ENS name

  useEffect(() => {
    const getEnsName = async () => {
      const provider = new ethers.AlchemyProvider(
        "mainnet",
        process.env.ALCHEMY_ID
      );

      try {
        const name = await provider.lookupAddress(address);
        setEnsName(name);
      } catch (error) {
        console.error(`Failed to get ENS name for address ${address}:`, error);
      }
    };

    getEnsName();
  }, [address]);

  return <span>{ensName}</span>;
};

export default ENSName;
