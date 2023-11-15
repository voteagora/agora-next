"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";
import { css } from "@emotion/css";
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
export default function ENSAvatar({ ensName }) {
  const [isClient, setIsClient] = useState(false);

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.ens_avatar}>
      {isClient && data && (
        <Image
          loader={imageLoader}
          alt="ENS Avatar"
          className={css`
            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            animation: 0.3s forwards fade-in;
          `}
          src={data}
          width={44}
          height={44}
        />
      )}

      <Image alt="Avatar" src={altAvatar} />
    </div>
  );
}
