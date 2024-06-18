import { useEnsName } from "wagmi";
import { HStack, VStack } from "@/components/Layout/Stack";
import ENSAvatar from "@/components/shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

interface DelegateProfileImageProps {
  address: string;
  votingPower?: string;
}

export const DelegateProfileImage = ({
  address,
  votingPower,
}: DelegateProfileImageProps) => {
  const { data } = useEnsName({
    cacheTime: 23 * 60 * 60,
    chainId: 1,
    address: address as `0x${string}`,
  });

  return (
    <HStack className="gap-4">
      <div className="relative aspect-square">
        <ENSAvatar className="w-[44px] h-[44px] rounded-full" ensName={data} />
      </div>

      <VStack>
        <div className="text-base font-semibold">
          <HumanAddress address={address} />
        </div>
        {votingPower && (
          <div className="text-xs font-semibold text-gray-800">
            <TokenAmountDisplay amount={votingPower} />
          </div>
        )}
      </VStack>
    </HStack>
  );
};
