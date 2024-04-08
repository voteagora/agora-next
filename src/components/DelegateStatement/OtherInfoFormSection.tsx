import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import DelegateStatementBoolSelector from "./DelegateStatementBoolSelector";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

export default function OtherInfoFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const { ui } = Tenant.current();
  const requireCodeOfConduct = ui.toggle("delegates/code-of-conduct")?.enabled;

  return (
    <div className="py-8 px-6 border-b border-gray-300">
      <h3 className="font-bold">Other info</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <DelegateStatementInputGroup
          title="Twitter"
          placeholder="@yourname"
          name="twitter"
          form={form}
        />
        <DelegateStatementInputGroup
          title="Discord"
          placeholder="yourname#2142"
          name="discord"
          form={form}
        />
        <DelegateStatementInputGroup
          title="Email (will not be public)"
          placeholder="you@gmail.com"
          name="email"
          form={form}
        />
        {requireCodeOfConduct && <DelegateStatementBoolSelector form={form} />}
      </div>
    </div>
  );
}
