import { useEnsName } from "wagmi";
import ENSAvatar from "@/components/shared/ENSAvatar";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
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
    <div className="flex flex-row gap-4">
      <div className="relative aspect-square text">
        <ENSAvatar className="w-[44px] h-[44px] rounded-full" ensName={data} />
      </div>

      <div className="flex flex-col">
        <div className="text-primary font-semibold">
          <ENSName address={address} />
        </div>
        {votingPower && (
          <div className="text-xs font-semibold text-secondary">
            <TokenAmountDisplay amount={votingPower} />
          </div>
        )}
      </div>
    </div>
  );
};
