"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CreateTopicModal from "./CreateTopicModal";
import useRequireLogin from "@/hooks/useRequireLogin";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const { namespace } = Tenant.current();

export default function NewTopicButton({ isDuna }: { isDuna: boolean }) {
  const [open, setOpen] = React.useState(false);
  const requireLogin = useRequireLogin();

  const handleClick = async () => {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      return;
    }
    setOpen(true);
  };

  //Todo: the colors for syndicate and towns need to be chagned in theme. cant make it conhesive with other tenants atm
  const bgStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE
      ? "bg-white"
      : "bg-buttonBackground";
  const textStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE ||
    namespace === TENANT_NAMESPACES.TOWNS
      ? "text-primary"
      : "text-neutral";

  return (
    <>
      <Button
        onClick={handleClick}
        className={`inline-flex h-9 px-4 py-2 items-center justify-center gap-2 shrink-0 rounded-md ${bgStyle} shadow-sm hover:bg-hoverBackground text-sm h-auto ${textStyle}`}
      >
        {isDuna ? "+ Discuss DUNA" : "+ New Topic"}
      </Button>

      <CreateTopicModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
