"use client";

import { useState, useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { icons } from "@/icons/icons";
import { TENANT_NAMESPACES } from "@/lib/constants";

const useDelayedLoader = (delayMs = 1500) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return shouldShow;
};

export default function AgoraLoader() {
  const shouldShow = useDelayedLoader();

  if (!shouldShow) return null;

  let loaderForTenant = icons.agoraLoaderDark;
  const { namespace } = Tenant.current();
  if (
    namespace === TENANT_NAMESPACES.XAI ||
    namespace === TENANT_NAMESPACES.DERIVE
  ) {
    loaderForTenant = icons.agoraLoaderLight;
  }

  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-268px)]">
      <Image src={loaderForTenant} alt="loading" width={120} height={120} />
    </div>
  );
}

export function AgoraLoaderSmall() {
  const shouldShow = useDelayedLoader();

  if (!shouldShow) return null;

  let loaderForTenant = icons.agoraLoaderDark;
  const { namespace } = Tenant.current();
  if (
    namespace === TENANT_NAMESPACES.XAI ||
    namespace === TENANT_NAMESPACES.DERIVE
  ) {
    loaderForTenant = icons.agoraLoaderLight;
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Image src={loaderForTenant} alt="loading" width={48} height={48} />
    </div>
  );
}

export function LogoLoader() {
  const shouldShow = useDelayedLoader();

  if (!shouldShow) return null;

  const { ui } = Tenant.current();
  return (
    <div className="w-full h-full min-h-screen animate-pulse flex flex-col justify-center items-center">
      <Image alt="loading" width={36} height={36} src={ui.logo} />
    </div>
  );
}
