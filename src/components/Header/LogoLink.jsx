import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import Link from "next/link";
import { instrumentSerif } from "@/styles/fonts";

export default function LogoLink() {
  const { ui, isProd } = Tenant.current();
  const isDUNA = ui.toggle("duna")?.enabled;
  const showDunaWordmark = Boolean(isDUNA && ui.dunaTitle);

  return (
    <Link
      href="/"
      className={`${instrumentSerif.variable} flex flex-row justify-between w-full`}
    >
      <div className="gap-2 h-full flex flex-row items-center w-full">
        {showDunaWordmark ? (
          <span className="font-instrumentSerif text-2xl pl-4">
            {ui.dunaTitle}
          </span>
        ) : (
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
        )}
        {!isProd && (
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
