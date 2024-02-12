import "server-only";

import prisma from "@/app/lib/prisma";
import { makeDynamoClient } from "@/app/lib/dynamodb";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { deploymentToDaoSlug } from "@/lib/config";

export const getDelegateStatementForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(
    getDelegateStatementForAddressForNamespace,
    addressOrENSName,
    { namespace }
  );

async function getDelegateStatementForAddressForNamespace({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}) {
  const daoSlug = deploymentToDaoSlug(namespace);

  const postgreqsqlData = await prisma.delegateStatements
    .findFirst({ where: { address: address.toLowerCase(), dao_slug: daoSlug } })
    .catch((error) => console.error(error));
  return postgreqsqlData
    ? postgreqsqlData
    : await getDelegateStatementForAddressDynamo({ address });
}

async function getDelegateStatementForAddressDynamo({
  address,
}: {
  address: string;
}) {
  const dynamoDBClient = makeDynamoClient();

  try {
    const data = await dynamoDBClient.getItem({
      TableName: "ApplicationData",
      Key: {
        PartitionKey: { S: "DelegateStatement" },
        SortKey: { S: address },
      },
      ProjectionExpression: "address, signature, signedPayload",
    });

    // If the item exists, return the payload
    if (data.Item) {
      // Extract the signedPayload attribute from the Item object
      const signedPayload = data.Item.signedPayload.S;

      const delegateStatementObject = JSON.parse(signedPayload as string);

      return {
        address, // assuming 'address' is a variable containing the address
        email: null,
        payload: {
          leastValuableProposals:
            delegateStatementObject.leastValuableProposals,
          mostValuableProposals: delegateStatementObject.mostValuableProposals,
          openToSponsoringProposals:
            delegateStatementObject.openToSponsoringProposals,
          delegateStatement: delegateStatementObject.delegateStatement,
          topIssues: delegateStatementObject.topIssues,
        },
        twitter: delegateStatementObject.twitter,
        discord: delegateStatementObject.discord,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
