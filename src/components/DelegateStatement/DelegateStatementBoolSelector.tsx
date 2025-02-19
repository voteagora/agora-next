import { type UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Tenant from "@/lib/tenant/tenant";

import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import CheckboxWithTitle from "../ui/CheckboxWithTitle/CheckboxWithTitle";

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
          <CheckboxWithTitle
            label={`Yes, I agree with the ${codeOfConductLink.title}`}
            title={
              <a
                href={codeOfConductLink.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Agree with the {codeOfConductLink.title}
              </a>
            }
            checked={agreeCodeConduct}
            onChange={handleAgreeCodeConduct}
          />
        </>
      )}
    </div>
  );
}
