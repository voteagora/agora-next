/*
 * TanStack Start port of src/app/notification-preferences/page.tsx.
 * URL: /notification-preferences
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import NotificationPreferencesClient from "@/app/notification-preferences/components/NotificationPreferencesClient";

export const Route = createFileRoute("/notification-preferences/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("notifications")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `Notification Preferences | ${brandName}` },
        {
          name: "description",
          content: `Manage email and notification preferences for ${brandName} governance updates.`,
        },
      ],
    };
  },
  component: () => <NotificationPreferencesClient />,
});
