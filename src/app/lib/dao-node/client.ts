import Tenant from "@/lib/tenant/tenant";
import { fetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";

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

    // If we have delegates data, fetch statements for the first 10 delegates
    if (data && data.delegates && data.delegates.length > 0) {
      // Take only the first 10 delegates
      const top10Delegates = data.delegates.slice(0, 10);
      const delegateAddresses = top10Delegates.map((delegate) =>
        delegate.addr.toLowerCase()
      );

      // Fetch statements for top 10 delegates using the fetchDelegateStatement function
      const statements = await Promise.all(
        delegateAddresses.map(async (address) => {
          try {
            const statement = await fetchDelegateStatement(address);
            return statement ? { address, statement } : null;
          } catch (error) {
            console.error(
              `Error fetching statement for address ${address}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out null values and create a map of address to statement
      const statementMap = new Map();
      statements.filter(Boolean).forEach((item) => {
        statementMap.set(item.address, item.statement);
      });

      // Merge the statements with the delegate data
      data.delegates = data.delegates.map((delegate) => {
        const lowerCaseAddress = delegate.addr.toLowerCase();
        // Only add statements for the top 10 delegates
        if (delegateAddresses.includes(lowerCaseAddress)) {
          return {
            address: lowerCaseAddress,
            votingPower: {
              total: delegate.votingPower || "0",
              direct: "0",
              advanced: "0",
            },
            statement: statementMap.get(lowerCaseAddress) || null,
          };
        }
        return {
          address: lowerCaseAddress,
          votingPower: {
            total: delegate.votingPower || "0",
            direct: "0",
            advanced: "0",
          },
          statement: null,
        };
      });

      // Limit the response to only the top 10 delegates
      data.delegates = data.delegates.slice(0, 10);

      // Print the data for debugging
      // console.log(
      //   "Delegates data with statements:",
      //   JSON.stringify(data, null, 2)
      // );
    }

    return data;
  } catch (error) {
    console.error("Error fetching delegates:", error);
    return null;
  }
};
