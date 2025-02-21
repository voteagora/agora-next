"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { GetEnsNameData } from "wagmi/query";

const imageLoader = ({ src }: { src: string }) => {
  return src;
};

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

  const [avatar, setAvatar] = useState(ui.assets.delegate);

  useEffect(() => {
    if (data) {
      setAvatar(data);
    }
  }, [data, ensName]);

  return (
    <div
      className={`overflow-hidden rounded-full flex justify-center items-center ${className}`}
    >
      <Image
        loader={imageLoader}
        alt="ENS Avatar"
        className="animate-in"
        src={avatar}
        width={size}
        height={size}
      />
    </div>
  );
}
