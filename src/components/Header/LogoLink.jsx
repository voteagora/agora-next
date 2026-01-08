import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";

export default function LogoLink() {
  const { ui, isMain } = Tenant.current();

  return (
    <Link href="/" className="flex flex-row justify-between w-full">
      <div className="gap-2 h-full flex flex-row items-center w-full">
        <Image
          src={ui.logo}
          alt="logo"
          width={ui.logoSize ? parseInt(ui.logoSize) : 48}
          height={ui.logoSize ? parseInt(ui.logoSize) : 48}
          className={
            ui.logoSize
              ? `h-[${parseInt(ui.logoSize) - 2}px] w-auto`
              : "h-[46px] w-auto"
          }
        />
        {!isMain && (
          <>
            <div className="h-3 w-[2px] bg-line rounded-full hidden sm:block"></div>
            <span className="hidden sm:block font-semibold text-primary bg-tertiary/10 px-1.5 py-0.5 rounded-lg text-xs border border-line whitespace-nowrap">
              Test Contracts
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
