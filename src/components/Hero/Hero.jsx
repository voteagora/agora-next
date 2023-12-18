import Image from "next/image";
import { HStack, VStack } from "../Layout/Stack";
import sunnyFace from "@/assets/optimism/sunny-face-sticker.svg";
import sunnyBg from "@/assets/optimism/sunny-bg-sticker.svg";
import agora from "@/assets/optimism/agora-sticker.svg";
import spark1 from "@/assets/optimism/spark1-sticker.svg";
import spark2 from "@/assets/optimism/spark2-sticker.svg";
import opToken from "@/assets/optimism/op-token-sticker.svg";
import thumb from "@/assets/optimism/thumb-sticker.svg";
import styles from "./hero.module.scss";

export default function Hero() {
  const tab = "delegates";
  return (
    <HStack justifyContent="justify-between" className={styles.hero_container}>
      <VStack className={styles.content_container}>
        <h1>Agora is the home of Optimism voters</h1>
        <p>
          {" "}
          {tab === "delegates"
            ? `OP Delegates are the stewards of the Optimism Token House, appointed
          by token holders to make governance decisions on their behalf.`
            : `OP Citizens are the stewards of the Optimism Citizens' House, selected
            based on the reputation as the Optimism Collective members.`}
        </p>
      </VStack>
      <div className={styles.partner_image_container}>
        <Image
          src={spark1}
          alt="optimism background"
          className={styles.spark1}
        />
        <Image
          src={spark2}
          alt="optimism background"
          className={styles.spark2}
        />
        <Image src={agora} alt="optimism background" className={styles.agora} />
        <Image
          src={opToken}
          alt="optimism background"
          className={styles.opToken}
        />
        <Image src={thumb} alt="optimism background" className={styles.thumb} />
        <Image
          src={sunnyBg}
          alt="optimism background"
          className={styles.sunny_bg}
        />
        <Image
          src={sunnyFace}
          alt="optimism background"
          className={styles.sunny_face}
        />
      </div>
    </HStack>
  );
}
