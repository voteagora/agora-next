import logo from "@/assets/logo.svg";
import Image from "next/image";
import { VStack } from "@/components/Layout/Stack";
import styles from "./agoraLoader.module.scss";

export default function AgoraLoader() {
  return (
    <VStack
      justifyContent="justify-center"
      alignItems="items-center"
      className={styles.loading_container}
    >
      <Image alt="loading" width={30} height={30} src={logo} />
    </VStack>
  );
}

export function AgoraLoaderSmall() {
  return (
    <VStack
      justifyContent="justify-center"
      alignItems="items-center"
      className={styles.loading_container__small}
    >
      <Image alt="loading" width={30} height={30} src={logo} />
    </VStack>
  );
}
