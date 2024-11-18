import { useEnsName, useEnsAvatar } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";

const AvatarAddress = ({ address }: { address: `0x${string}` }) => {
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });

  const { data: ensAvatar } = useEnsAvatar({
    chainId: 1,
    name: ensName as string,
  });
  return (
    <span className="flex flex-row space-x-2 items-center">
      {ensAvatar && <img src={ensAvatar} className="w-6 h-6 rounded-full" />}
      <p className="text-primary">
        {ensName ? ensName : truncateAddress(address)}
      </p>
    </span>
  );
};

export default AvatarAddress;
