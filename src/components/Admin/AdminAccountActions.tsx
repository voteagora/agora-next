"use client";

import { Button } from "@/components/ui/button";
import { Fragment } from "react";

export default function AdminAccountActions() {
  const handleAccountTransfer = () => {};

  return (
    <section className="gl_box bg-neutral">
      <h1 className="font-extrabold text-2xl text-primary">Account Actions</h1>
      <p className="text-secondary">
        Perform administrative actions on your account
      </p>
      <AccountActions
        title={"Transfer"}
        description={"Transfer account role to another address"}
        actions={[{ title: "Transfer", onClick: handleAccountTransfer }]}
      />
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
      <Button title={props.title} onClick={props.onClick}>
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
