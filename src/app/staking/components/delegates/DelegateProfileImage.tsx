import { useEnsName } from "wagmi";
import ENSAvatar from "@/components/shared/ENSAvatar";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import ENSName from "@/components/shared/ENSName";
import AvatarImage from "@/components/shared/AvatarImage";

interface DelegateProfileImageProps {
  address: string;
  votingPower?: string;
  username?: string | null;
  avatar?: string | null;
}

export const DelegateProfileImage = ({
  address,
  votingPower,
  username,
  avatar,
}: DelegateProfileImageProps) => {
  const { data } = useEnsName({
    query: { staleTime: 23 * 60 * 60 },
    chainId: 1,
    address: address as `0x${string}`,
  });
  const displayUsername = username?.trim();

  return (
    <div className="flex flex-row gap-4">
      <div className="relative aspect-square text">
        {avatar ? (
          <AvatarImage
            src={avatar}
            alt={`${displayUsername || address} avatar`}
            className="w-[44px] h-[44px] rounded-full"
            size={44}
          />
        ) : (
          <ENSAvatar
            className="w-[44px] h-[44px] rounded-full"
            ensName={data}
          />
        )}
      </div>

      <div className="flex flex-col">
        <div className="text-primary font-semibold">
          {displayUsername || <ENSName address={address} />}
        </div>
        {votingPower && (
          <div className="text-xs font-semibold text-secondary">
            <TokenAmountDecorated amount={votingPower} />
          </div>
        )}
      </div>
    </div>
  );
};
