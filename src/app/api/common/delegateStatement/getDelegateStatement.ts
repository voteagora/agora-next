import "server-only";

import prisma from "@/app/lib/prisma";
import { makeDynamoClient } from "@/app/lib/dynamodb";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";

export const getDelegateStatement = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getDelegateStatementForAddress, addressOrENSName);

async function getDelegateStatementForAddress({
  address,
}: {
  address: string;
}) {
  const { slug } = Tenant.current();

  const postgreqsqlData = await prisma.delegateStatements
    .findFirst({ where: { address: address.toLowerCase(), dao_slug: slug } })
    .catch((error) => console.error(error));
  return postgreqsqlData
    ? postgreqsqlData
    : slug === DaoSlug.OP // Only fetch from Dynamo for optimism
    ? await getDelegateStatementForAddressDynamo(address)
    : null;
}

async function getDelegateStatementForAddressDynamo(address: string) {
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
