"use client";

import { useEffect, useState } from "react";
import { useEnsAvatar } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { GetEnsNameData } from "wagmi/query";
import Image from "next/image";

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
      setAvatar(data);
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
