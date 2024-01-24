"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";
import avatar0 from "./avatars/avatar0.svg";
import avatar1 from "./avatars/avatar1.svg";
import avatar2 from "./avatars/avatar2.svg";
import avatar3 from "./avatars/avatar3.svg";
import avatar4 from "./avatars/avatar4.svg";
import avatar5 from "./avatars/avatar5.svg";
import avatar6 from "./avatars/avatar6.svg";
import avatar7 from "./avatars/avatar7.svg";

const imageLoader = ({ src }) => {
  return src;
};

// TODO: Might be better to load the avatar on the server
export default function ENSAvatar({ ensName, className = "" }) {
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName,
  });

  const avatars = [
    avatar0,
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
  ];

  const altAvatar =
    avatars[!ensName ? 0 : (ensName.charCodeAt(0) % 97) % avatars.length];

  const [avatar, setAvatar] = useState(altAvatar);

  useEffect(() => {
    if (data) {
      setAvatar(data);
    }
    // Set the default avatar when wallet is change from a ensName wallet to a non ensName wallet
    if (!data && !ensName) {
      setAvatar(altAvatar);
    }
  }, [altAvatar, data, ensName]);

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
