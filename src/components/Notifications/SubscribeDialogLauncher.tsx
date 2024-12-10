"use client";

import { useEffect } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";

const SubscribeDialogLauncher = () => {
  const { ui } = Tenant.current();
  const openDialog = useOpenDialog();

  // CHECK IF USER ALREADY SUBSCRIBED OR RESPONDED TO THE SUBSCRIPTION FORM

  useEffect(() => {
    if (ui.toggle("email-subscriptions")) {
      openDialog({
        type: "SUBSCRIBE",
        params: {},
      });
    }
  }, []);

  return null;
};

export default SubscribeDialogLauncher;
