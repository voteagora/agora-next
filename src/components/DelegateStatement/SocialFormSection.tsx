import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";

export default function SocialFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  return (
    <div className="">
      <div className="p-6">
        <h3 className="font-semibold text-base leading-6 text-primary mb-2">
          Social Accounts
        </h3>
        <p className="text-base font-medium leading-6 mb-6 text-secondary">
          Let your delegates get to know you better! Add your social accounts to
          share your presence in the governance community.
        </p>
        <div className="grid grid-cols-1 gap-6 mt-4">
          <DelegateStatementInputGroup
            title="X (formerly Twitter)"
            placeholder="@yourname"
            name="twitter"
            form={form}
          />
          <DelegateStatementInputGroup
            title="Warpcast"
            placeholder="@yourname"
            name="warpcast"
            form={form}
          />
          <DelegateStatementInputGroup
            title="Discord"
            placeholder="yourname#2142"
            name="discord"
            form={form}
          />
        </div>
      </div>
    </div>
  );
}
