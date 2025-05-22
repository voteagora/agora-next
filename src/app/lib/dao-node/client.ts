import Tenant from "@/lib/tenant/tenant";

const { contracts, namespace } = Tenant.current();

export const getDaoNodeURLForNamespace = (namespace: string) => {
  const url = process.env.DAONODE_URL_TEMPLATE;
  let parsedUrl = url?.replace("{TENANT_NAMESPACE}", namespace);
  if (parsedUrl && !parsedUrl.endsWith("/")) {
    parsedUrl = `${parsedUrl}/`;
  }

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

  try {
    const response = await fetch(`${url}v1/delegate/${address}`);
    const data: DaoNodeDelegate = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getProposalTypesFromDaoNode = async () => {
  const url = getDaoNodeURLForNamespace(namespace);
  const supportScopes = contracts.supportScopes;
  if (!url || !supportScopes) {
    return null;
  }

  const response = await fetch(`${url}v1/proposal_types`);
  const data = await response.json();

  return data;
};
