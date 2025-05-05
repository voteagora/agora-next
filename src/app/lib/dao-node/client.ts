import Tenant from "@/lib/tenant/tenant";

const { contracts, namespace } = Tenant.current();

export const getDaoNodeURLForNamespace = (namespace: string) => {
  const url = process.env.DAONODE_URL_TEMPLATE;
  const parsedUrl = url?.replace("{TENANT_NAMESPACE}", namespace);
  return parsedUrl;
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

export const getDelegatesFromDaoNode = async () => {
  const url = getDaoNodeURLForNamespace(namespace);
  console.log(url);
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(`${url}/v1/delegates`);
    if (!response.ok) {
      throw new Error(`Failed to fetch delegates: ${response.status}`);
    }

    const data = await response.json();

    // Print the data for debugging
    console.log("Delegates data:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("Error fetching delegates:", error);
    return null;
  }
};
