"use client";

import type { FC, ReactNode } from "react";
import {
  DialogProviderCore,
  type DialogDefinitionMap,
} from "./DialogProviderCore";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { UndelegateDialog } from "../UndelegateDialog/UndelegateDialog";
import { AdvancedDelegateDialog } from "../AdvancedDelegateDialog/AdvancedDelegateDialog";
import { PartialDelegationDialog } from "../PartialDelegateDialog/PartialDelegationDialog";
import { EncourageConnectWalletDialog } from "@/components/Delegates/Delegations/EncourageConnectWalletDialog";
import { SwitchNetwork } from "../SwitchNetworkDialog/SwitchNetworkDialog";

const delegateDialogs: DialogDefinitionMap = {
  DELEGATE: (
    { delegate, fetchDirectDelegatee, isDelegationEncouragement },
    closeDialog
  ) => (
    <DelegateDialog
      delegate={delegate}
      fetchDirectDelegatee={fetchDirectDelegatee}
      isDelegationEncouragement={isDelegationEncouragement}
    />
  ),
  UNDELEGATE: ({
    delegate,
    fetchBalanceForDirectDelegation,
    fetchDirectDelegatee,
  }) => (
    <UndelegateDialog
      delegate={delegate}
      fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
      fetchDirectDelegatee={fetchDirectDelegatee}
    />
  ),
  PARTIAL_DELEGATE: (
    { delegate, fetchCurrentDelegatees, isDelegationEncouragement },
    closeDialog
  ) => (
    <PartialDelegationDialog
      closeDialog={closeDialog}
      delegate={delegate}
      fetchCurrentDelegatees={fetchCurrentDelegatees}
      isDelegationEncouragement={isDelegationEncouragement}
    />
  ),
  ADVANCED_DELEGATE: (
    { target, fetchAllForAdvancedDelegation, isDelegationEncouragement },
    closeDialog
  ) => (
    <AdvancedDelegateDialog
      target={target}
      fetchAllForAdvancedDelegation={fetchAllForAdvancedDelegation}
      completeDelegation={closeDialog}
      isDelegationEncouragement={isDelegationEncouragement}
    />
  ),
  SWITCH_NETWORK: ({ chain }, closeDialog) => (
    <SwitchNetwork chain={chain} closeDialog={closeDialog} />
  ),
  ENCOURAGE_CONNECT_WALLET: ({}, closeDialog) => (
    <EncourageConnectWalletDialog closeDialog={closeDialog} />
  ),
};

export const DelegateDialogProvider: FC<{ children: ReactNode }> = ({
  children,
}) => (
  <DialogProviderCore dialogDefinitions={delegateDialogs}>
    {children}
  </DialogProviderCore>
);
