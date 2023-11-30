import Image from "next/image";
import { HStack, VStack } from "../Layout/Stack";
import sunnyFace from "@/assets/optimism/sunny-face.svg";
import sunnyBg from "@/assets/optimism/sunny-bg.svg";
import styles from "./hero.module.scss";

export default function Hero() {
  const tab = "delegates";
  return (
    <HStack justifyContent="justify-between" className={styles.hero_container}>
      <VStack className={styles.content_container}>
        <h1>
          Agora is the home of <span>Optimism</span> voters
        </h1>
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
        <Image src={sunnyBg} alt="optimism background" className={styles.sunny_bg}/>
        <Image
          src={sunnyFace}
          alt="optimism background"
          className={styles.sunny_face}
        />
      </div>
    </HStack>
  );
}
