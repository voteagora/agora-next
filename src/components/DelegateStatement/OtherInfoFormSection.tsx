import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import DelegateStatementBoolSelector, {
  DelegateStatementDaoPrinciplesSelector,
} from "./DelegateStatementBoolSelector";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import NotificationSelector from "./NotificationSelector";
import Tenant from "@/lib/tenant/tenant";

export default function OtherInfoFormSection({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const { ui } = Tenant.current();
  const requireCodeOfConduct = ui.toggle("delegates/code-of-conduct")?.enabled;
  const requireDaoPrinciples = ui.toggle("delegates/dao-principles")?.enabled;
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;

  return (
    <div className="py-8 px-6 border-b border-line">
      <h3 className="font-bold text-primary">Other info</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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
        <DelegateStatementInputGroup
          title="Email (will not be public)"
          placeholder="you@gmail.com"
          name="email"
          form={form}
        />
        <div className="col-span-full">
          {requireCodeOfConduct && (
            <DelegateStatementBoolSelector form={form} />
          )}
          {requireDaoPrinciples && (
            <DelegateStatementDaoPrinciplesSelector form={form} />
          )}
          {supportsNotifications && <NotificationSelector form={form} />}
        </div>
      </div>
    </div>
  );
}
