import styles from "./styles.module.scss";
import Image from "next/image";
import { useEnsAvatar } from "wagmi";

const imageLoader = ({ src }) => {
  return src;
};

export default function ENSAvatar({ ensName }) {
  const { data } = useEnsAvatar({
    chainId: 1,
    name: ensName,
  });

  return (
    <div className={styles.ens_avatar}>
      <Image
        loader={imageLoader}
        src={data || "/images/placeholder_avatar.png"}
        alt={`${ensName} avatar`}
        width={44}
        height={44}
      />
    </div>
  );
}
