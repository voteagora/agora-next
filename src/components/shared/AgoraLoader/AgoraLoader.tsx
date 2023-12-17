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
      <Image alt="loading" width={24} height={24} src={logo} />
    </VStack>
  );
}
