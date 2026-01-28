import { redirect } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import NotificationPreferencesClient from "./components/NotificationPreferencesClient";

export default function NotificationPreferencesPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("notifications")?.enabled) {
    redirect("/");
  }

  return <NotificationPreferencesClient />;
}
