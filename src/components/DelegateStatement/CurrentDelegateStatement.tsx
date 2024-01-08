"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import {
  fetchDelegateStatement,
  fetchDelegateStatementDynamoDB,
} from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementForm from "./DelegateStatementForm";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { type DelegateStatementWithDynamoDB } from "@/app/api/delegateStatement/delegateStatement";

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
        const data = await fetchDelegateStatementDynamoDB(address as string);
        // TODO: frh -> pending to refactor when delegates/[addressOrEnsName]/page will be getting data from postgreqsql first
        if (data) {
          delete data.delegateStatement;
          delete data.openToSponsoringProposals;
        }
        setDelegateStatement(data);
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
