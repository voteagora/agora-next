import logo from "@/assets/agora_logo.svg";
import Image from "next/image";
import styles from "./agoraLoader.module.scss";

export default function AgoraLoader() {
  return (
    <div
      className={`flex flex-col justify-center items-center ${styles.loading_container}`}
    >
      <Image alt="loading" width={24} height={24} src={logo} />
    </div>
  );
}

export function AgoraLoaderSmall() {
  return (
    <div
      className={`flex flex-col justify-center items-center ${styles.loading_container__small}`}
    >
      <Image alt="loading" width={24} height={24} src={logo} />
    </div>
  );
}
