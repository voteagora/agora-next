import Image from "next/image";
import { HStack, VStack } from "../Layout/Stack";
import heroBackGroundImage from "@/assets/optimism/optimism_hero_background.png";
import styles from "./hero.module.scss";

export default function Hero() {
  const tab = "delegates";
  return (
    <HStack justifyContent="justify-between" className={styles.hero_container}>
      <VStack className={styles.content_container}>
        <h1>
          Agora is the home of <span>Optimism</span> Voters
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
      <Image
        src={heroBackGroundImage}
        alt="optimism background"
        className="gl_hero_bg_image"
      />
    </HStack>
  );
}
