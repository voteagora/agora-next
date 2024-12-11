"use client";

import { useEffect } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { useDelegate } from "@/hooks/useDelegate";

const SubscribeDialogLauncher = () => {
  const { address } = useAccount();

  const { ui } = Tenant.current();
  const openDialog = useOpenDialog();
  const { data: delegate } = useDelegate({ address: address });

  useEffect(() => {
    if (
      ui.toggle("email-subscriptions") &&
      (delegate?.statement?.notification_preferences
        .wants_proposal_created_email === "not-voted" ||
        delegate?.statement?.notification_preferences
          .wants_proposal_ending_soon_email === "not-voted")
    ) {
      openDialog({
        type: "SUBSCRIBE",
        params: {},
      });
    }
  }, [delegate]);

  return null;
};

export default SubscribeDialogLauncher;
