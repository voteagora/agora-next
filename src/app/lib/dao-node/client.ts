import Tenant from "@/lib/tenant/tenant";

export const getDaoNodeURLForNamespace = (namespace: string) => {
  const url = process.env.DAONODE_URL_TEMPLATE;
  const parsedUrl = url?.replace("{TENANT_NAMESPACE}", namespace);
  return parsedUrl;
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
