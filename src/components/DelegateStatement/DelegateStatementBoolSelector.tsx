import { type UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { Checkbox } from "@/components/ui/checkbox";

import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";

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
        <>
          <span>
            <label className="flex items-center mb-3 text-tertiary font-semibold text-xs leading-4">
              Agree with the {codeOfConductLink.title}
            </label>
          </span>
          <label className="flex items-center mb-4 font-semibold text-primary">
            <Checkbox
              checked={agreeCodeConduct}
              onCheckedChange={(checked) =>
                handleAgreeCodeConduct(checked === true ? true : false)
              }
              className="mr-2"
            />
            Yes, I agree with the {codeOfConductLink.title}
          </label>
        </>
      )}
    </div>
  );
}
