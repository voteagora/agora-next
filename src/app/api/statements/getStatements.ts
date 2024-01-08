import { makeDynamoClient } from "@/app/lib/dynamodb";
import { addressOrEnsNameWrap } from "../utils/ensName";

import "server-only";

// TODO: frh -> refactor this and getDelegateStatement(postgresql)
export const getStatement = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getStatementForAddress, addressOrENSName);

async function getStatementForAddress({ address }: { address: string }) {
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
        // TODO: pending to refactor when delegates/[addressOrEnsName]/page will be getting data from postgreqsql first
        delegateStatement: delegateStatementObject.delegateStatement,
        openToSponsoringProposals:
          delegateStatementObject.openToSponsoringProposals,
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
