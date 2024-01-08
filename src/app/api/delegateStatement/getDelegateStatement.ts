import "server-only";

import prisma from "@/app/lib/prisma";
import { makeDynamoClient } from "@/app/lib/dynamodb";
import { addressOrEnsNameWrap } from "../utils/ensName";

export const getDelegateStatement = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getDelegateStatementForAddress, addressOrENSName);

async function getDelegateStatementForAddress({ address }: { address: string }) {
  const postgreqsqlData = await prisma.delegateStatements.findFirst({ where: { address: address.toLowerCase() } }).catch(error => console.error(error));
  return postgreqsqlData ? postgreqsqlData : await getDelegateStatementForAddressDynamo({ address });
}

async function getDelegateStatementForAddressDynamo({ address }: { address: string }) {
  const dynamoDBClient = makeDynamoClient();

  const params = {
    TableName: "ApplicationData", // Replace with your actual DynamoDB table name
    KeyConditionExpression: "PartitionKey = :pk AND SortKey = :sk",
    ExpressionAttributeValues: {
      ":pk": { S: "DelegateStatement" }, // 'PartitionKey' should match the actual partition key attribute name
      ":sk": { S: address }, // Replace with the actual sort key value
    },
    ProjectionExpression: "address, signature, signedPayload",
  };

  try {
    const data = await dynamoDBClient.query(params);

    // If the item exists, return the payload
    if (data.Items && data.Items.length > 0) {
      // Extract the signedPayload attribute from the Item object
      const signedPayload = data.Items[0].signedPayload.S;

      const delegateStatementObject = JSON.parse(signedPayload as string);

      return {
        address, // assuming 'address' is a variable containing the address
        email: null,
        payload: {
          leastValuableProposals: delegateStatementObject.leastValuableProposals,
          mostValuableProposals: delegateStatementObject.mostValuableProposals,
          openToSponsoringProposals: delegateStatementObject.openToSponsoringProposals,
          delegateStatement: delegateStatementObject.delegateStatement,
          topIssues: delegateStatementObject.topIssues
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

