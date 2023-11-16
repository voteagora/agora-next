import { HStack, VStack } from "../Layout/Stack";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import styles from "./styles.module.scss";

export default function MetricContainer({ icon, title, body, link = null }) {
  return (
    <HStack gap={3} className={styles.metric_card_container}>
      <div className={styles.icon_container}>
        <Image src={icons[icon]} alt={icon} width="24" height="24" />
      </div>

      <VStack className="pr-1">
        <div className={styles.header_container}>
          {title}

          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Image
                src={icons["link"]}
                alt={icons["link"]}
                width="12"
                height="12"
              />
            </a>
          )}
        </div>

        <div className={styles.body_container}>{body}</div>
      </VStack>
    </HStack>
  );
}
