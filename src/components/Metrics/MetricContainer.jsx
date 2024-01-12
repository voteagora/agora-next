import { HStack, VStack } from "../Layout/Stack";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import styles from "./metrics.module.scss";
import { cn } from "@/lib/utils";

export default function MetricContainer({ icon, title, body, link = null }) {
  return (
    <>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.metric_card_container_link}
        >
          <HStack
            gap={3}
            className={cn(styles.metric_card_container, styles.hover)}
          >
            <div className={styles.icon_container}>
              <Image src={icons[icon]} alt={icon} width="24" height="24" />
            </div>
            <VStack>
              <div className={styles.header_container}>
                <HStack gap={1}>
                  {title}
                  <Image
                    src={icons["link"]}
                    alt={icons["link"]}
                    width="12"
                    height="12"
                  />
                </HStack>
              </div>

              <div className={styles.body_container}>{body}</div>
            </VStack>
          </HStack>
        </a>
      ) : (
        <div className={styles.metric_card_container_link}>
          <HStack gap={3} className={styles.metric_card_container}>
            <div className={styles.icon_container}>
              <Image src={icons[icon]} alt={icon} width="24" height="24" />
            </div>
            <VStack>
              <div className={styles.header_container}>{title}</div>

              <div className={styles.body_container}>{body}</div>
            </VStack>
          </HStack>
        </div>
      )}
    </>
  );
}
