import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useCallback, useEffect, useState } from "react";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";

export function AdvancedDelegateButton({
  delegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}: {
  delegate: DelegateChunk;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
}) {
  const openDialog = useOpenDialog();

  return (
    <>
      <Button
        onClick={(e: any) => {
          e.preventDefault();
          openDialog({
            type: "ADVANCED_DELEGATE",
            params: {
              target: delegate.address,
              fetchVotingPowerForSubdelegation,
              checkIfDelegatingToProxy,
              fetchCurrentDelegatees,
              getProxyAddress,
            },
          });
        }}
      >
        Delegate
      </Button>
    </>
  );
}
