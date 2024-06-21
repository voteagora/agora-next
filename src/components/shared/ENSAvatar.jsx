"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const imageLoader = ({ src }) => {
  return src;
};

// TODO: Might be better to load the avatar on the server
export default function ENSAvatar({ ensName, className = "" }) {
  const { ui } = Tenant.current();
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName,
  });

  const [avatar, setAvatar] = useState(ui.assets.delegate);

  useEffect(() => {
    if (data) {
      setAvatar(data);
    }
  }, [data, ensName]);

  return (
    <div className={`${styles.ens_avatar} ${className}`}>
      <Image
        loader={imageLoader}
        alt="ENS Avatar"
        className={styles.image}
        src={avatar}
        width={44}
        height={44}
      />
    </div>
  );
}
