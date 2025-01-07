import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { AgoraIcon } from "@/icons/AgoraIcon";

export default function LogoLink() {
  const { namespace, ui } = Tenant.current();

  return (
    <Link href="/" className="flex flex-row justify-between w-full">
      <div className="gap-2 h-full flex flex-row items-center w-full">
        {namespace !== TENANT_NAMESPACES.SCROLL && (
          <>
            <AgoraIcon
              fill={"#FF00FF"}
              className="hidden sm:block w-[20px] h-[20px]"
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
