import { type UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";

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
      <h4 className="flex items-center mb-3 text-secondary font-semibold text-xs leading-4">
        Agree to receive proposal updates via email
      </h4>

      <label className="flex items-center mb-4 font-semibold text-primary">
        <Checkbox
          checked={subscribed}
          onCheckedChange={(checked) =>
            handleChange(checked === true ? true : false)
          }
          className="mr-2"
        />
        Yes, I want to receive emails
      </label>
    </div>
  );
}
