"use client";

import { useEffect, useState } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { useDelegate } from "@/hooks/useDelegate";

const SubscribeDialogLauncher = () => {
  const { address } = useAccount();

  const { ui } = Tenant.current();
  const openDialog = useOpenDialog();
  const { data: delegate } = useDelegate({ address: address });
  const [hasShownRootDialog, setHasShownRootDialog] = useState<boolean>(false);

  useEffect(() => {
    setHasShownRootDialog(
      localStorage.getItem("agora-email-subscriptions--root") === "prompted"
    );
  }, []);

  // 1. make sure tenant supports this feature
  // 2. make sure we haven't already shown the root dialog
  // 3. make sure delegate is marked as "prompt" (should prompt)
  useEffect(() => {
    if (
      ui.toggle("email-subscriptions") &&
      !hasShownRootDialog &&
      (delegate?.statement?.notification_preferences
        .wants_proposal_created_email === "prompt" ||
        delegate?.statement?.notification_preferences
          .wants_proposal_ending_soon_email === "prompt")
    ) {
      openDialog({
        type: "SUBSCRIBE",
        params: {
          type: "root",
        },
      });
    }
  }, [delegate]);

  return null;
};

export default SubscribeDialogLauncher;
