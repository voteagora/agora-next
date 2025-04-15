import { TENANT_NAMESPACES } from "../constants";
import Tenant from "../tenant/tenant";

export const getDaoNodeURLForNamespace = (namespace: string) => {
  switch (namespace) {
    case TENANT_NAMESPACES.UNISWAP:
      return "https://uniswap.dev.agoradata.xyz/";
    case TENANT_NAMESPACES.CYBER:
      return "https://cyber.dev.agoradata.xyz/";
    case TENANT_NAMESPACES.ENS:
      return "https://ens.dev.agoradata.xyz/";
    case TENANT_NAMESPACES.SCROLL:
      return "https://scroll.dev.agoradata.xyz/";
    case TENANT_NAMESPACES.OPTIMISM:
      return "https://optimism.dev.agoradata.xyz/";
    default:
      return null;
  }
};

export const getDelegateFromDaoNode = async (address: string) => {
  const { namespace, ui } = Tenant.current();
  const url = getDaoNodeURLForNamespace(namespace);
  const isDaoNodeDelegateAddressEnabled = ui.toggle(
    "dao-node/delegate/addr"
  )?.enabled;
  if (!url || !isDaoNodeDelegateAddressEnabled) {
    return null;
  }

  const response = await fetch(`${url}v1/delegate/${address}`);
  const data: DaoNodeDelegate = await response.json();

  return data;
};
