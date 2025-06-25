"use client";

import { Button } from "@/components/ui/button";
import { Button } from "@/components/Button";
import { Fragment } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useAccount, useReadContract } from "wagmi";
import { GOVERNOR_TYPE } from "@/lib/constants";

export default function AdminAccountActions() {
  const openDialog = useOpenDialog();
  const accountActionToggles = {
    transfer: false,
  };
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  const handleAccountTransfer = () => {
    openDialog({
      type: "ACCOUNT_ACTION",
      params: {},
    });
  };
  const actionsToRender = [];

  // Get the Manager and Admin Accounts to determine if features should render
  const { data: managerAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "manager",
    chainId: contracts.governor?.chain.id,
  }) as { data: `0x${string}` };

  const { data: adminAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
    chainId: contracts.governor?.chain.id,
  }) as { data: `0x${string}` };

  // Compare governor_type to derive transfer authority
  const getTransferAuthority = () => {
    switch (contracts.governorType) {
      case GOVERNOR_TYPE.AGORA:
        return adminAddress;
      case GOVERNOR_TYPE.ALLIGATOR:
        return managerAddress;
      // case GOVERNOR_TYPE.ENS:
      // // Not Implemented
      // case GOVERNOR_TYPE.BRAVO:
      // // Not Implemented
      default:
        return adminAddress;
    }
  };

  if (address === getTransferAuthority()) {
    accountActionToggles.transfer = true;
  }

  if (accountActionToggles.transfer) {
    actionsToRender.push(
      <AccountActions
        title={"Transfer"}
        description={"Transfer account role to another address"}
        actions={[{ title: "Transfer", onClick: handleAccountTransfer }]}
      />
    );
  }

  return (
    <section className="gl_box bg-neutral">
      <h1 className="font-extrabold text-2xl text-primary">Account Actions</h1>
      <p className="text-secondary">
        Perform administrative actions on your account
      </p>
      {actionsToRender.length > 0
        ? actionsToRender.map((action, index) => (
            <Fragment key={index}>{action}</Fragment>
          ))
        : "No account actions for this account"}
    </section>
  );
}

interface AccountActionButtonProps {
  title: string;
  onClick: () => void;
}

function AccountActionButton(props: AccountActionButtonProps) {
  return (
    <div className="flex ml-10">
      <Button
        title={props.title}
        onClick={props.onClick}
        variant="secondary"
      >
        {props.title}
      </Button>
    </div>
  );
}

interface AccountActionsProps {
  title: string;
  description: string;
  actions: Array<{ title: string; onClick: () => void }>;
}

function AccountActions(props: AccountActionsProps) {
  return (
    <Fragment>
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-primary">{props.title}</p>
        <p className="text-sm text-muted-foreground p-2">{props.description}</p>
        {props.actions.map((action, index) => (
          <AccountActionButton
            key={index}
            title={action.title}
            onClick={action.onClick}
          />
        ))}
      </div>
    </Fragment>
  );
}
