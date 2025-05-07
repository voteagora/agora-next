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

export const getDelegatesFromDaoNode = async (options?: {
  sortBy?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const url = getDaoNodeURLForNamespace(namespace);
  if (!url) {
    return null;
  }

  console.log("DAO Node fetch options:", {
    sortBy: options?.sortBy || "VP",
    reverse: options?.reverse ?? true,
    offset: options?.offset || 0,
    limit: options?.limit,
  });

  try {
    const sortBy = options?.sortBy || "VP";
    const reverse = options?.reverse ?? true;
    const offset = options?.offset || 0;
    const limit = options?.limit;

    const queryParams = new URLSearchParams({
      sort_by: sortBy,
      reverse: reverse.toString(),
      include: "VP,DC,PR,LVB",
    });

    const response = await fetch(`${url}/v1/delegates?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch delegates: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.delegates && data.delegates.length > 0) {
      console.log("First delegate entry (raw):", data.delegates[0]);
    }

    // Print the first ten entries in the data with voting power in e18 format
    if (data && data.delegates && data.delegates.length > 0) {
      const formattedDelegates = data.delegates
        .slice(0, 10)
        .map((delegate) => ({
          ...delegate,
          voting_power_e18: delegate.voting_power
            ? (BigInt(delegate.voting_power) / BigInt(10 ** 18)).toString()
            : "0",
        }));
      console.log(
        "First ten delegate entries (with voting power in e18):",
        formattedDelegates
      );
    }

    // Apply pagination in memory before processing delegate statements
    if (data && data.delegates) {
      // Apply offset and limit to the data
      const paginatedDelegates = data.delegates.slice(
        offset,
        limit ? offset + limit : undefined
      );

      // Replace the original delegates array with the paginated one
      data.delegates = paginatedDelegates;
    }

    // If we have delegates data, fetch statements for the delegates
    if (data && data.delegates && data.delegates.length > 0) {
      const delegateAddresses = data.delegates.map((delegate) =>
        delegate.addr.toLowerCase()
      );

      // Fetch statements for delegates using the fetchDelegateStatement function
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
        return {
          address: lowerCaseAddress,
          votingPower: {
            total: delegate.voting_power || "0",
            direct: "0",
            advanced: "0",
          },
          statement: statementMap.get(lowerCaseAddress) || null,
        };
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching delegates:", error);
    return null;
  }
};
