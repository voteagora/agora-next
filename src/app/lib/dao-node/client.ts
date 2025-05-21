import Tenant from "@/lib/tenant/tenant";
import { fetchDelegateStatements } from "@/app/api/common/delegateStatement/getDelegateStatement";

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

  try {
    const sortBy = options?.sortBy || "VP";
    const reverse = options?.reverse ?? true;
    const offset = options?.offset || 0;
    const limit = options?.limit;

    const queryParams = new URLSearchParams({
      sort_by: sortBy,
      reverse: reverse.toString(),
      include: "VP,DC,PR,LVB,MRD,VPC",
    });

    const response = await fetch(`${url}v1/delegates?${queryParams}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch delegates: ${response.status}`);
    }

    const data = await response.json();

    // Apply pagination in memory before processing delegate statements
    if (data && data.delegates) {
      const paginatedDelegates = data.delegates.slice(
        offset,
        limit ? offset + limit : undefined
      );
      data.delegates = paginatedDelegates;
    }

    if (data && data.delegates && data.delegates.length > 0) {
      const delegateAddresses = data.delegates.map(
        (delegate: { addr: string }) => delegate.addr.toLowerCase()
      );

      const statements = await fetchDelegateStatements({
        addresses: delegateAddresses,
      });

      const statementMap = new Map();
      statements.forEach((statement) => {
        if (statement) {
          statementMap.set(statement.address.toLowerCase(), statement);
        }
      });

      // Merge the statements with the delegate data
      data.delegates = data.delegates.map(
        (delegate: {
          addr: string;
          VP?: string;
          DC?: number;
          PR?: number;
          VPC?: string;
        }) => {
          const lowerCaseAddress = delegate.addr.toLowerCase();
          return {
            address: lowerCaseAddress,
            votingPower: {
              total: delegate.VP || "0",
              direct: delegate.VP || "0",
              advanced: "0",
            },
            statement: statementMap.get(lowerCaseAddress) || null,
            numOfDelegators: delegate.DC?.toString() || "0",
            mostRecentDelegationBlock: "0",
            lastVoteBlock: "0",
            vpChange7d: delegate.VPC || "0",
            participation: delegate.PR || 0,
          };
        }
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching delegates:", error);
    return null;
  }
};
