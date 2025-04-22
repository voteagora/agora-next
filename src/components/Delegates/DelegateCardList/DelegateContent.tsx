"use client";

import DelegateCardList from "./DelegateCardList";
import DelegateTable from "./DelegateTable";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useQueryState, parseAsString } from "nuqs";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateContent({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const [layout] = useQueryState("layout", parseAsString.withDefault("grid"));
  const { address } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const openDialog = useOpenDialog();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!address && !showDialog) {
        openDialog({
          type: "ENCOURAGE_CONNECT_WALLET",
          params: {},
        });
        setShowDialog(true);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [address, showDialog, openDialog]);

  useEffect;

  return layout === "grid" ? (
    <DelegateCardList
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  ) : (
    <DelegateTable
      initialDelegates={initialDelegates}
      fetchDelegates={fetchDelegates}
    />
  );
}
