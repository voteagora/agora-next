"use server";

import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { HStack, VStack } from "../Layout/Stack";
import styles from "./hero.module.scss";

export default async function Hero() {
  const { namespace, ui } = Tenant.current();
  const { title, description } = ui.page("/");

  return (
    <HStack justifyContent="justify-between" className={styles.hero_container}>
      <VStack className={styles.content_container}>
        <h1>{title}</h1>
        <p> {description}</p>
      </VStack>
      {ui.hero && (
        <Image
          className="h-[110px] w-auto"
          alt={`${namespace} cover`}
          src={ui.hero}
        />
      )}
    </HStack>
  );
}
