"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

interface ENSAvatarProps {
  ensName: string;
  className?: string;
}

const imageLoader = ({ src }: { src: string }) => {
  return src;
};

// TODO: Might be better to load the avatar on the server
export default function ENSAvatar({ ensName, className = "" }: ENSAvatarProps) {
  const { ui } = Tenant.current();
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName,
  });

  const [avatar, setAvatar] = useState<string>(ui.assets.delegate);

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
        width={44}
        height={44}
      />
    </div>
  );
}