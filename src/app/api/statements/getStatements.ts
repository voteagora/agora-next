import { makeDynamoClient } from "@/app/lib/dynamodb";

import "server-only";
import { addressOrEnsNameWrap } from "../utils/ensName";

export const getStatment = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getStatmentForAddress, addressOrENSName);

async function getStatmentForAddress({ address }: { address: string }) {
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
        address: address, // assuming 'address' is a variable containing the address
        delegateStatement: delegateStatementObject.delegateStatement,
        openToSponsoringProposals:
          delegateStatementObject.openToSponsoringProposals,
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
