"use client";

import { useMemo } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const allowList = [
  "0xc6921E6c4e1fDA9A1a4670c479a1377137DD5A2c", // jefag test 1
  "0x4D5d7d63989BBE6358a3352A2449d59Aa5A08267", // Dom Test 1
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
  "0xD6CE44F039250dddb3b1fB3AAd1F68E838713B45", // OP Foundation
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
  "0xA58090dd84D143ca90e95B05395e0F116A727714", // Jacopo Test 2
  "0xA18D0226043A76683950f3BAabf0a87Cfb32E1Cb", // stepandel.eth
  "0xEA64B234316728f1BFd3b7cDCc1EAf0066D8E055", // Stepan Test 2
  "0x924A0468961f09aB3c3A457382C9D06f48cff6aA", // Stepan Test 4
  "0xd2c6730b06925090243c2D50df7c47a0B220D433", // Stepan Test 5
  "0xb979C87c6502D745ef8A438ccBD8cc9b27502991", // Stepan Test 6
  "0x97301D575F517A70E66Bd1A92886F7c7D2e3959B", // Stepan Test 7
  "0xeCbdDA9c9Fa136389ab212EdB5e7295b266f7277", // Stepan Test 8
  "0x875A3f19AFFd58c5615d6eb4a6136AA13c1Dc387", // Stepan Test 9 (Rainbow)
  "0xb55C9A9Fda63A39D24A276d02315656eA3125cD6", // Stepan Test 10 (Coinbase)
  "0xD753a89450213A8D7f7aCCE3a615d71ebD97366d", // Anika
  "0x000372c2ad29A4C1D89d6d8be7eb1349b103BABd", // Woj Test 1
  "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8", // Agora manager throwaway
  "0xC776cBDDeA014889E8BaB4323C894C5c34DB214D", // Fernando
  "0x1d671d1B191323A38490972D58354971E5c1cd2A", // Andrei
  "0xDfAFa55C52bEEe3548272E3c2678BDf5B65D33b4", // Josiah
  "0xE61E4B3e1ADf8a2735976c83a3f44C28E952bc8D", // QA 3
  "0x4713a905d98E2C793e25F7bF2fEEa76e18f12DC6", // QA 5
  "0xD208ae597785CfccF46f78A65fDB2BE000E8074a", // QA 6
  "0x74dc8Df481dd6daC9C8431947f505562badcfC20", // QA 7
  "0x5a02851627752d2aEb3d0084002387dA51A13402", // QA 8
  "0xa919348b2e20a7AAa33a41e04E7286E4eeD8889e", // QA 9
  "0x30b6e0b4f29FA72E8C7D014B6309668024ceB881", // QA 10
  "0x9b3d738C07Cd0E45eE98a792bA48ba67Bb5dAbca", // QA 11
  "0x416a0343470ac6694D39e2fCd6C494eeEF39BeEB", // SAFE QA 3
  "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB", // Michael test
  "0x8d5237037A590A2dB531F3CfB8f42605cF306f34", // Pedro test
  "0xe681327Ef751A706998B1861f77A4A082E511bd5", // Bryan
] as `0x${string}`[];

const useIsAdvancedUser = () => {
  const { contracts, isProd } = Tenant.current();
  const { address } = useAccount();

  const { data: balance, isFetched: isBalanceFetched } = useReadContract({
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    functionName: "balanceOf",
    query: {
      enabled: !!address,
    },
    args: [address!],
    chainId: contracts.token.chain.id,
  }) as { data: bigint | undefined; isFetched: boolean };

  /**
   * @dev Checks if the user is an advanced user
   * PROD: only allowlist
   * TEST: more than 1 token or allowlist
   */
  const isAdvancedUser = useMemo(() => {
    if (!isBalanceFetched) return false;
    if (!address) return false;
    if (!balance) return false;
    const allowedBalance = parseUnits("100000", 18);
    return isProd
      ? allowList.includes(address)
      : balance >= allowedBalance || allowList.includes(address);
  }, [address, balance, isBalanceFetched, isProd]);

  return { isAdvancedUser };
};

export default useIsAdvancedUser;
