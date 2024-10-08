import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";
import { HStack } from "../Layout/Stack";
import logo from "@/assets/agora_logo.svg";

export default function LogoLink() {
  const { namespace, ui } = Tenant.current();

  return (
    <HStack justifyContent="justify-between">
      <Link href="/">
        <HStack className="gap-2 h-full" alignItems="items-center">
          {/*{namespace !== TENANT_NAMESPACES.NEW_DAO && (*/}
          <>
            <Image
              src={logo}
              alt="logo"
              width="20"
              height="20"
              className="hidden sm:block"
            />
            <div className="h-3 w-[2px] bg-line rounded-full hidden sm:block"></div>
          </>
          {/*)}*/}
          <Image src={ui.logo} alt="logo" width="20" height="20" />
          <span className="hidden sm:block font-medium text-primary">{`${ui.title}`}</span>
        </HStack>
      </Link>
    </HStack>
  );
}
