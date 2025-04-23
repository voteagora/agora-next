import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { icons } from "@/icons/icons";
import { TENANT_NAMESPACES } from "@/lib/constants";

let loaderForTenant = icons.agoraLoaderDark;
const { namespace } = Tenant.current();
if (
  namespace === TENANT_NAMESPACES.XAI ||
  namespace === TENANT_NAMESPACES.DERIVE
) {
  loaderForTenant = icons.agoraLoaderLight;
}

export default function AgoraLoader() {
  return (
    <div className="flex flex-col justify-center items-center  h-[calc(100vh-268px)]">
      <Image src={loaderForTenant} alt="loading" width={120} height={120} />
    </div>
  );
}

export function AgoraLoaderSmall() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Image src={loaderForTenant} alt="loading" width={48} height={48} />
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
