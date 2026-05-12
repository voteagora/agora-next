"use client";

import { useEnsAvatar } from "wagmi";
import { GetEnsNameData } from "wagmi/query";
import AvatarImage from "./AvatarImage";

// TODO: Might be better to load the avatar on the server
export default function ENSAvatar({
  ensName,
  className = "",
  size = 44,
}: {
  ensName?: string | GetEnsNameData;
  className?: string;
  size?: number;
}) {
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName as string,
  });

  return (
    <AvatarImage
      src={data}
      alt="ENS Avatar"
      className={className}
      imageClassName="object-contain"
      size={size}
    />
  );
}
