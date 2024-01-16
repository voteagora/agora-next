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
