import styles from "./styles.module.scss";
import Image from "next/image";

export default function ENSAvatar({ address }) {
  return (
    <div className={styles.ens_avatar}>
      <Image
        src="/images/placeholder_avatar.png"
        alt={`${address} avatar`}
        width={44}
        height={44}
      />
    </div>
  );
}
