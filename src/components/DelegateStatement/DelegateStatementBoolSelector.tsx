import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import { useState } from "react";
import Tenant from "@/lib/tenant/tenant";

export default function DelegateStatementBoolSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const [agreeCodeConduct, setAgreeCodeConduct] = useState(false);
  const { ui } = Tenant.current();

  const handleAgreeCodeConduct = (agreeCodeConduct: boolean) => {
    setAgreeCodeConduct(agreeCodeConduct);
    form.setValue("agreeCodeConduct", agreeCodeConduct);
  };

  const codeOfConductLink = ui.link("code-of-conduct");

  return (
    <div className="flex flex-col">
      {codeOfConductLink && (
        <h4 className="font-bold text-xs mb-2">
          Agree with{" "}
          <a href={codeOfConductLink.url} target="_blank">
            {codeOfConductLink.title}
          </a>
        </h4>
      )}
      <Tabs>
        <TabsList variant="bool">
          <TabsTrigger
            variant="bool"
            value="yes"
            data-state={agreeCodeConduct ? "active" : "inactive"}
            onClick={() => handleAgreeCodeConduct(true)}
          >
            Yes
          </TabsTrigger>
          <TabsTrigger
            variant="bool"
            value="no"
            data-state={!agreeCodeConduct ? "active" : "inactive"}
            onClick={() => handleAgreeCodeConduct(false)}
          >
            No
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
