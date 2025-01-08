import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { AgoraIcon } from "@/icons/AgoraIcon";

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
  return (
    <div className="w-full h-full min-h-screen animate-pulse flex flex-col justify-center items-center">
      <AgoraIcon
        fill={rgbStringToHex(ui.customization?.primary)}
        className="w-[44px] h-[44px]"
      />
    </div>
  );
}
