import logo from "@/assets/agora_logo.svg";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";

export default function AgoraLoader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen animate-pulse">
      <Image alt="loading" width={24} height={24} src={logo} />
    </div>
  );
}

export function AgoraLoaderSmall() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full animate-pulse">
      <Image alt="loading" width={24} height={24} src={logo} />
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
