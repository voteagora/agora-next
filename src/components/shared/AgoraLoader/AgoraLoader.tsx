import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { AgoraIcon } from "@/icons/AgoraIcon";
import Image from "next/image";

const { ui } = Tenant.current();
export default function AgoraLoader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen animate-pulse">
      <AgoraIcon
        fill={rgbStringToHex(ui.customization?.primary)}
        className="w-[24px] h-[24px]"
      />
    </div>
  );
}

export function AgoraLoaderSmall() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full animate-pulse">
      <AgoraIcon
        fill={rgbStringToHex(ui.customization?.primary)}
        className="w-[24px] h-[24px]"
      />
    </div>
  );
}

export function LogoLoader() {
  const { ui } = Tenant.current();
  return (
    <div className="w-full h-full min-h-screen animate-pulse flex flex-col justify-center items-center">
      <Image alt="loading" width={36} height={36} src={ui.logo} />
    </div>
  );
}
