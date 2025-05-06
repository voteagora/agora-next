import Tenant from "@/lib/tenant/tenant";
import { prismaWeb3Client } from "@/app/lib/prisma";

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

    // If we have delegates data, fetch their statements from the database
    if (data && data.delegates && data.delegates.length > 0) {
      const delegateAddresses = data.delegates.map((delegate) =>
        delegate.address.toLowerCase()
      );

      // Fetch statements for all delegates in a single query
      const statements = await prismaWeb3Client.$queryRawUnsafe(
        `
        SELECT 
          address,
          row_to_json(sub) as statement
        FROM (
          SELECT 
            address,
            (SELECT row_to_json(stmt)
              FROM (
                SELECT
                  signature,
                  payload,
                  twitter,
                  discord,
                  created_at,
                  updated_at,
                  warpcast,
                  endorsed
                FROM agora.delegate_statements s
                WHERE s.address = d.address AND s.dao_slug = $1::config.dao_slug
                LIMIT 1
              ) stmt
            ) AS statement
          FROM unnest($2::text[]) AS d(address)
        ) sub
        WHERE statement IS NOT NULL
      `,
        slug,
        delegateAddresses
      );

      // Create a map of address to statement for easy lookup
      const statementMap = new Map();
      statements.forEach((item) => {
        statementMap.set(item.address, item.statement);
      });

      // Merge the statements with the delegate data
      data.delegates = data.delegates.map((delegate) => ({
        ...delegate,
        statement: statementMap.get(delegate.address.toLowerCase()) || null,
      }));
    }

    // Print the data for debugging
    console.log(
      "Delegates data with statements:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.error("Error fetching delegates:", error);
    return null;
  }
};
