import { HStack } from "@/components/Layout/Stack";
import styles from "./pageHeader.module.scss";

export default function PageHeader({ headerText }) {
  return (
    <HStack
      justifyContent="justify-between"
      className={styles.page_header_container}
    >
      <h1>{headerText}</h1>
      <HStack gap={4}></HStack>
    </HStack>
  );
}
