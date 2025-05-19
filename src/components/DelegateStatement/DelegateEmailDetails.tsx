import Tenant from "@/lib/tenant/tenant";
import DelegateStatementInputGroup from "./DelegateStatementInputGroup";
import NotificationSelector from "./NotificationSelector";

export const DelegateEmailDetails = ({ form }: { form: any }) => {
  const { ui } = Tenant.current();
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;
  return (
    <div>
      <div className="p-6">
        <h3 className="font-bold text-primary mb-2">Email Notifications</h3>
        <p className="mb-6">
          Stay informed about key delegation events and governance actions.
        </p>

        <DelegateStatementInputGroup
          title="Email"
          placeholder="you@gmail.com"
          name="email"
          form={form}
        />
        <div className="col-span-ful mt-4">
          {supportsNotifications && <NotificationSelector form={form} />}
        </div>
      </div>
    </div>
  );
};
