import Tenant from "@/lib/tenant/tenant";
import { AgoraLoader as Loader } from "@/icons/AgoraLoader";
import Image from "next/image";

export default function AgoraLoader() {
  return (
    <div className="flex flex-col justify-center items-center  h-[calc(100vh-268px)]">
      <Loader className="w-[120px] h-[120px] animate-[spin_5s_linear_infinite]" />
    </div>
  );
}

export function AgoraLoaderSmall() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Loader className="w-[48px] h-[48px] animate-[spin_5s_linear_infinite]" />
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
