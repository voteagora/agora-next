"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useContractRead } from "wagmi";

const useIsAdvancedUser = () => {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const [isAdvancedUser, setIsAdvancedUser] = useState(false);
  const allowList = [
    "0x4D5d7d63989BBE6358a3352A2449d59Aa5A08267",
    "0xd0f23E5ea6c8088eD0FFf294F3fC29e719EE6B8b",
    "0xde748c3dd4311A5d6b305E2eeFd6481BCDA1e84B", // Base tester
    "0x85A0779CA390adaD02Aa63075373bF33e7C5a711", // Base tester
    "0xC3FdAdbAe46798CD8762185A09C5b672A7aA36Bb", // Yitong
    "0x730C22Cd09aE53Dfe09DB4bEB2bFca433DEf9919", // OP Address
    "0xE30AcDdC6782d82C0CBE00349c27CB4E78C51510", // Pif
    "0x8775A0489bd87c40cd40807B6A9eED145aB84E03", // Bobby
    "0x30Cf218b751f0204d906962798d6d6251AE67eF4", // Justine
    "0x47C88bb92B409fF25F6587EA611fac4e55f76007", // Vee
    "0x4a6894Dd556fab996f8D50b521f900CAEedC168e", // Jonas
    "0x2326344ced704c4109a4d24777ec2c288f91206f", // Shaun
    "0xa6e8772af29b29B9202a073f8E36f447689BEef6", // GFX Labs
    "0x0988E41C02915Fe1beFA78c556f946E5F20ffBD3", // GFX Labs 2
    "0x406b607644c5D7BfDA95963201E45A4c6AB1c159", // SNX 1
    "0x4d5d7d63989bbe6358a3352a2449d59aa5a08267", // SNX 2
    "0x6EdA5aCafF7F5964E1EcC3FD61C62570C186cA0C", // opmichael
    "0x5d36a202687fD6Bd0f670545334bF0B4827Cc1E2", //launamu
    "0xa142aB9eab9264807A41F0E5cbDab877D204E233", //Krzys from L2Beat personal
    "0x7fC80faD32Ec41fd5CfcC14EeE9C31953b6B4a8B", //Brichis
    "0xb5c2A415Ad256f641605C757C3c79e59d4c77782", // Kent Test 1
    "0xd0f23E5ea6c8088eD0FFf294F3fC29e719EE6B8b", // Kent Test 2
    "0x603F5A389d893624A648424aD58a33205F8fC59c", // Kent Test 3
    "0xdF40cED4E9B256BC6b237F27C0001265f0d0BdA8", // Kent Test 4
    "0xC323Ee1d28D2508667f4BEbfC26F93c60aBdD203", // kentf.eth
    "0x4817B42Ec28851EF581a74855A89D2b8c45A33DD", // Kent Test 5
    "0x6EF3E0179e669C77C82664D0feDad3a637121Efe", // Jacopo Test
    "0xA18D0226043A76683950f3BAabf0a87Cfb32E1Cb", // stepandel.eth
    "0xEA64B234316728f1BFd3b7cDCc1EAf0066D8E055", // Stepan Test 2
    "0x924A0468961f09aB3c3A457382C9D06f48cff6aA", // Stepan Test 4
    "0xd2c6730b06925090243c2D50df7c47a0B220D433", // Stepan Test 5
    "0xb979C87c6502D745ef8A438ccBD8cc9b27502991", // Stepan Test 6
    "0x97301D575F517A70E66Bd1A92886F7c7D2e3959B", // Stepan Test 7
    "0xeCbdDA9c9Fa136389ab212EdB5e7295b266f7277", // Stepan Test 8
    "0xD753a89450213A8D7f7aCCE3a615d71ebD97366d", // Anika
  ] as `0x${string}`[];

  useContractRead({
    address: OptimismContracts.token.address as `0x${string}`,
    abi: OptimismContracts.token.abi,
    functionName: "balanceOf",
    enabled: isConnected && !!address,
    args: [address!],
    /**
     * @dev Checks if the user is an advanced user
     * PROD: only allowlist
     * TEST: more than 1 token or allowlist
     */
    onSuccess: (balance) => {
      const allowedBalance = parseUnits("100000", 18);
      setIsAdvancedUser(
        process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
          ? allowList.includes(address!)
          : balance >= allowedBalance || allowList.includes(address!)
      );
    },
  });

  return { isAdvancedUser };
};

export default useIsAdvancedUser;
