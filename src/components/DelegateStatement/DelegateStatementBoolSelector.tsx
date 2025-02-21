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

export function DelegateStatementDaoPrinciplesSelector({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const [agreeDaoPrinciples, setAgreeDaoPrinciples] = useState(false);
  const { ui } = Tenant.current();

  const handleAgreeDaoPrinciples = (agreeDaoPrinciples: boolean) => {
    setAgreeDaoPrinciples(agreeDaoPrinciples);
    form.setValue("agreeDaoPrinciples", agreeDaoPrinciples);
  };

  const daoPrinciplesLink = ui.link("dao-principles");

  return (
    <div className="flex flex-col">
      {daoPrinciplesLink && (
        <>
          <span>
            <label className="flex items-center mb-3 text-secondary font-semibold text-xs leading-4">
              Agree with the {daoPrinciplesLink.title}
            </label>
          </span>
          <label className="flex items-center mb-4 font-semibold text-primary">
            <Checkbox
              checked={agreeDaoPrinciples}
              onCheckedChange={(checked) =>
                handleAgreeDaoPrinciples(checked === true ? true : false)
              }
              className="mr-2"
            />
            Yes, I agree with the {daoPrinciplesLink.title}
          </label>
        </>
      )}
    </div>
  );
}
