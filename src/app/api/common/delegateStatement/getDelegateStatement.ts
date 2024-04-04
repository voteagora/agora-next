import "server-only";

import prisma from "@/app/lib/prisma";
import { cache } from "react";
import { makeDynamoClient } from "@/app/lib/dynamodb";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";

export const getDelegateStatement = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getDelegateStatementForAddress, addressOrENSName);

// TODO: typegen these from OAS

type DelegateStatement = {
  address: string;
  email: string | null;
  payload: DelegateStatementPayload;
  twitter: string | null;
  discord: string | null;
};

type DelegateStatementPayload = {
  leastValuableProposals: string[];
  mostValuableProposals: string[];
  openToSponsoringProposals: boolean;
  delegateStatement: string;
  topIssues: Issue[];
}

type Issue = {
  type: string;
  value: string;
}

/*
  Gets delegate statement from Postgres, or DynamoDB if not found
*/
async function getDelegateStatementForAddress({
  address,
}: {
  address: string;
}) : Promise<DelegateStatement | null>{
  const { slug } = Tenant.current();

  const postgreqsqlData = await prisma.delegateStatements
    .findFirst({ where: { address: address.toLowerCase(), dao_slug: slug } })
    .then((data) => {
      // convert data.payload from Prisma.JSONValue to DelegateStatementPayload
      return {
        address: data?.address as string,
        email: data?.email as string,
        twitter: data?.twitter as string,
        discord: data?.discord as string,
        payload: JSON.parse(data?.payload as string) as DelegateStatementPayload,
      }
    })
    .catch((error) => console.error(error));
  return postgreqsqlData
    ? postgreqsqlData
    : slug === DaoSlug.OP // Only fetch from Dynamo for optimism
    ? await getDelegateStatementForAddressDynamo(address)
    : null;
}

/*
  Gets delegate statement from DynamoDB
*/
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

export const fetchDelegateStatement = cache(getDelegateStatement);
