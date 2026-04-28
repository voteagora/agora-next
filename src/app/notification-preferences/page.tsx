import { redirect } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import NotificationPreferencesClient from "./components/NotificationPreferencesClient";
import { buildPageMetadata } from "@/app/lib/utils/metadata";

export async function generateMetadata() {
  const { brandName } = Tenant.current();

  return buildPageMetadata({
    title: `Notification Preferences | ${brandName}`,
    description: `Manage email and notification preferences for ${brandName} governance updates.`,
    path: "/notification-preferences",
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function NotificationPreferencesPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("notifications")?.enabled) {
    redirect("/");
  }

  return <NotificationPreferencesClient />;
}
