import { type UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { TENANT_NAMESPACES } from "@/lib/constants";

import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import CheckboxWithTitle from "../ui/CheckboxWithTitle/CheckboxWithTitle";

export default function NotificationSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const wantsProposalCreatedEmail = form.getValues(
      "notificationPreferences.wants_proposal_created_email"
    );
    const wantsProposalEndingSoonEmail = form.getValues(
      "notificationPreferences.wants_proposal_ending_soon_email"
    );

    setSubscribed(
      wantsProposalCreatedEmail === true ||
        wantsProposalEndingSoonEmail === true
    );
  }, [form]);

  const handleChange = (value: boolean) => {
    setSubscribed(value);
    form.setValue(
      "notificationPreferences.wants_proposal_created_email",
      value
    );
    form.setValue(
      "notificationPreferences.wants_proposal_ending_soon_email",
      value
    );
  };

  TENANT_NAMESPACES.OPTIMISM;

  return (
    <div className="flex flex-col">
      <CheckboxWithTitle
        label="Yes, I want to receive emails"
        checked={subscribed}
        onChange={handleChange}
        title="Agree to receive proposal updates via email"
      />
    </div>
  );
}
