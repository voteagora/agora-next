import { useEnsName } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import ENSAvatar from "@/components/shared/ENSAvatar";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import ENSName from "@/components/shared/ENSName";

interface DelegateProfileImageProps {
  address: string;
  votingPower?: string;
}

export const DelegateProfileImage = ({
  address,
  votingPower,
}: DelegateProfileImageProps) => {
  const { data } = useEnsName({
    query: { staleTime: 23 * 60 * 60 },
    chainId: 1,
    address: address as `0x${string}`,
  });

  return (
    <HStack className="gap-4">
      <div className="relative aspect-square">
        <ENSAvatar className="w-[44px] h-[44px] rounded-full" ensName={data} />
      </div>

      <VStack>
        <div className="text-primary font-semibold">
          <ENSName address={address} />
        </div>
        {votingPower && (
          <div className="text-xs font-semibold text-gray-800">
            <TokenAmountDecorated amount={votingPower} />
          </div>
        )}
      </VStack>
    </HStack>
  );
};
