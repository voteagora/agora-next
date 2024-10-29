import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { useEnsName, useAccount } from "wagmi";

export function ProposalSingleNonVoter({
  voter,
}: {
  voter: { delegate: string; direct_vp: string };
}) {
  const { address: connectedAddress } = useAccount();
  const { data } = useEnsName({
    chainId: 1,
    address: voter.delegate as `0x${string}`,
  });

  console.log(voter);

  return (
    <VStack
      key={voter.delegate}
      gap={2}
      className="text-xs text-tertiary px-0 py-1"
    >
      <HStack
        justifyContent="justify-between"
        className="font-semibold text-secondary"
      >
        <HStack gap={1} alignItems="items-center">
          <ENSAvatar ensName={data} className="w-5 h-5" />
          <HumanAddress address={voter.delegate} />
          {voter.delegate === connectedAddress?.toLowerCase() && <p>(you)</p>}
        </HStack>
        <HStack alignItems="items-center">
          <TokenAmountDisplay amount={voter.direct_vp} />
        </HStack>
      </HStack>
    </VStack>
  );
}
