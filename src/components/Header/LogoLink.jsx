import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/agora_logo.svg";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function LogoLink() {
  const { namespace, ui } = Tenant.current();

  return (
    <Link href="/" className="flex flex-row justify-between w-full">
      <div className="gap-2 h-full flex flex-row items-center w-full">
        {namespace !== TENANT_NAMESPACES.SCROLL && (
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
        )}
        <Image
          src={ui.logo}
          alt="logo"
          width="24"
          height="24"
          className="h-[24px] w-auto"
        />
        <span className="hidden sm:block font-medium text-primary flex-1">{`${ui.title}`}</span>
      </div>
    </Link>
  );
}
