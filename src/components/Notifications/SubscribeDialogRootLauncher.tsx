"use client";

import { useOpenDialogOptional } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useDelegate } from "@/hooks/useDelegate";
import Tenant from "@/lib/tenant/tenant";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const SubscribeDialogLauncher = () => {
  const { address } = useAccount();

  const { ui } = Tenant.current();
  const openDialog = useOpenDialogOptional();
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
  // 4. make sure openDialog is available (DialogProvider is mounted)
  useEffect(() => {
    if (
      openDialog &&
      ui.toggle("email-subscriptions")?.enabled &&
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
  }, [delegate, hasShownRootDialog, openDialog]);

  return null;
};

export default SubscribeDialogLauncher;
