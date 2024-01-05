"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementForm from "./DelegateStatementForm";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { type DelegateStatementWithDynamoDB } from "@/app/api/delegateStatement/delegateStatement";

async function queryDynamoDB(address: string) {
  const query = `
  query($address: String!) {
    delegate(addressOrEnsName: $address) {
      statement {
        statement
        mostValuableProposals {
          number
        }
        leastValuableProposals {
          number
        }
        discord
        twitter
        topIssues {
          type
          value
        }
        openToSponsoringProposals
      }
    }
  }  
  `;

  const url = "https://vote.optimism.io/graphql";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { address },
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (result.errors) {
      console.error("error", result.errors);
    } else {
      return result.data;
    }
  } catch (error) {
    console.error("Error fetching GraphQL:", error);
  }
}

export default function CurrentDelegateStatement() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatementWithDynamoDB | null>(null);

  useEffect(() => {
    async function _getDelegateStatement() {
      const _delegateStatement = await fetchDelegateStatement(
        address as string
      ).catch((error) => console.error(error));
      if (_delegateStatement) {
        setDelegateStatement(_delegateStatement);
      } else {
        const data = await queryDynamoDB(address as string);
        if (data?.delegate?.statement) {
          const {
            discord,
            leastValuableProposals,
            mostValuableProposals,
            openToSponsoringProposals,
            statement,
            topIssues,
            twitter,
          } = data?.delegate?.statement;

          setDelegateStatement({
            address: address as string,
            email: null,
            payload: {
              leastValuableProposals,
              mostValuableProposals,
              openToSponsoringProposals,
              delegateStatement: statement,
              topIssues,
            },
            twitter,
            discord,
          });
        }
      }
      setLoading(false);
    }
    if (address) {
      _getDelegateStatement();
    }
  }, [address]);

  if (!isConnected) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  return loading ? (
    <AgoraLoader />
  ) : (
    <DelegateStatementForm delegateStatement={delegateStatement} />
  );
}
