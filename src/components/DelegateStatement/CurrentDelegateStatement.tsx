"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { fetchDelegateStatement } from "@/app/delegates/actions";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementForm from "./DelegateStatementForm";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { type DelegateStatement } from "@/app/api/delegateStatement/delegateStatement";

export default function CurrentDelegateStatement() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [delegateStatement, setDelegateStatement] =
    useState<DelegateStatement | null>(null);

  useEffect(() => {
    async function _getDelegateStatement() {
      const _delegateStatement = await fetchDelegateStatement(
        address as string
      ).catch((error) => console.error(error));
      setDelegateStatement(_delegateStatement as DelegateStatement);
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
