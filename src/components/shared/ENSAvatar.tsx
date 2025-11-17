"use client";

import { useEffect, useState } from "react";
import { useEnsAvatar } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { GetEnsNameData } from "wagmi/query";
import Image from "next/image";
import { resolveIPFSUrl } from "@/lib/utils";

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
  const { ui } = Tenant.current();
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName as string,
  });

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      // Resolve IPFS URLs to HTTP gateway URLs
      // Note: resolveIPFSUrl returns null for NFT references (eip155:...)
      // wagmi's useEnsAvatar should already resolve NFT avatars, but if it returns
      // an unresolved NFT reference, we skip it and show the placeholder
      const resolvedUrl = resolveIPFSUrl(data);
      setAvatar(resolvedUrl);
    } else {
      // Reset avatar when data changes to null
      setAvatar(null);
    }
  }, [data, ensName]);

  return (
    <div
      className={`overflow-hidden rounded-full flex justify-center items-center ${className}`}
    >
      {avatar ? (
        <img
          alt="ENS Avatar"
          className={`animate-in w-[${size}px] h-[${size}px] object-contain`}
          src={avatar}
        />
      ) : (
        <Image
          alt="ENS Avatar"
          className="animate-in"
          src={ui.assets.delegate}
          width={size}
          height={size}
        />
      )}
    </div>
  );
}
