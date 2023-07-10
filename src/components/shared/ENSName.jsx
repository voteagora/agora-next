import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

const EnsName = ({ address }) => {
  const [ensName, setEnsName] = useState(address); // Initialize with the address as the ENS name

  useEffect(() => {
    const getEnsName = async () => {
      const provider = new ethers.providers.AlchemyProvider(
        "homestead",
        process.env.NEXT_PUBLIC_ALCHEMY_ID
      );

      try {
        const name = await provider.lookupAddress(address);
        setEnsName(name);
      } catch (error) {
        console.error(`Failed to get ENS name for address ${address}:`, error);
        // Don't change the ensName state in case of an error
      }
    };

    getEnsName();
  }, [address]);

  return <p>{ensName}</p>;
};

export default EnsName;
