import logo from "@/assets/agora_logo.svg";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";
import { HStack } from "../Layout/Stack";
import styles from "./header.module.scss";

export default function LogoLink() {
  const { namespace, ui } = Tenant.current();

  return (
    <HStack justifyContent="justify-between" className={styles.logo_link}>
      <Link href="/">
        <HStack className="gap-2 h-full" alignItems="items-center">
          <Image
            src={logo}
            alt="logo"
            width="16"
            height="16"
            className="hidden sm:block"
          />
          <div className="h-3 w-[2px] bg-stone-200 rounded-full hidden sm:block"></div>
          <Image src={ui.logo} alt="logo" width="18" height="18" />
          <span className="hidden sm:block font-medium capitalize">{`${ui.title}`}</span>
        </HStack>
      </Link>
    </HStack>
  );
}
