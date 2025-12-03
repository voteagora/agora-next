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

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Discord Webhook URL
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://discord.com/api/webhooks/..."
          {...form.register("notificationPreferences.discord_webhook_url")}
        />
        {form.formState.errors.notificationPreferences?.discord_webhook_url && (
          <p className="mt-1 text-sm text-red-600">
            {
              form.formState.errors.notificationPreferences.discord_webhook_url
                .message
            }
          </p>
        )}
      </div>
    </div>
  );
}
