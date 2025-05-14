import Tenant from "@/lib/tenant/tenant";
import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import NotificationSelector from "./NotificationSelector";

export const DelegateEmailDetails = ({ form }: { form: any }) => {
  const { ui } = Tenant.current();
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;
  return (
    <div className="py-8 px-6">
      <DelegateStatementInputGroup
        title="Email (will not be public)"
        placeholder="you@gmail.com"
        name="email"
        form={form}
      />
      <div className="col-span-full">
        {supportsNotifications && <NotificationSelector form={form} />}
      </div>
    </div>
  );
};
