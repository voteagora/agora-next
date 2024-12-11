import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import { useState, useEffect } from "react";

export default function NotificationSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(
      form.getValues("notificationPreferences.wants_proposal_created_email") ||
        form.getValues(
          "notificationPreferences.wants_proposal_ending_soon_email"
        )
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

  return (
    <div className="flex flex-col">
      <h4 className="font-bold text-xs mb-2">
        Agree to receive proposal updates via email
      </h4>

      <Tabs>
        <TabsList variant="bool">
          <TabsTrigger
            variant="bool"
            value="yes"
            data-state={subscribed ? "active" : "inactive"}
            onClick={() => handleChange(true)}
          >
            Yes
          </TabsTrigger>
          <TabsTrigger
            variant="bool"
            value="no"
            data-state={!subscribed ? "active" : "inactive"}
            onClick={() => handleChange(false)}
          >
            No
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
