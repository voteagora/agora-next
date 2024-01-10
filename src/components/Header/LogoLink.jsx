import Link from "next/link";
import logo from "@/assets/logo.svg";
import oplogo from "@/assets/optimism/op-logo.svg";
import { HStack } from "../Layout/Stack";
import Image from "next/image";
import styles from "./header.module.scss";

export default function LogoLink({ instance_name }) {
  return (
    <HStack justifyContent="justify-between" className={styles.logo_link}>
      <Link href="/">
        <HStack className="gap-2 h-full" alignItems="items-center">
          <Image src={logo} alt="logo" width="16" height="16" />
          <div className="h-3 w-[2px] bg-stone-200 rounded-full"></div>
          <Image src={oplogo} alt="logo" width="18" height="18" />
          <span className="hidden md:block font-medium">{`${instance_name} Agora`}</span>
        </HStack>
      </Link>
    </HStack>
  );
}
