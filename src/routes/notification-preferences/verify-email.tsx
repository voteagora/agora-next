/*
 * TanStack Start port of src/app/notification-preferences/verify-email/page.tsx.
 * URL: /notification-preferences/verify-email
 */

import { CheckCircle2, XCircle } from "lucide-react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notification-preferences/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) ?? undefined,
    error: (search.error as string) ?? undefined,
    email: (search.email as string) ?? undefined,
  }),
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
        { title: `Verify Email | ${brandName}` },
        {
          name: "description",
          content: `Verify an email address for ${brandName} governance notifications.`,
        },
      ],
    };
  },
  component: function VerifyEmailPage() {
    const { status, error, email } = Route.useSearch();
    const isSuccess = status === "success";

    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 pb-16 pt-12 text-center">
        {isSuccess ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-positive/10">
              <CheckCircle2 className="h-8 w-8 text-positive" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-primary">
                Email Verified!
              </h1>
              <p className="text-secondary">
                {email ? (
                  <>
                    Your email address <strong>{email}</strong> has been
                    verified successfully.
                  </>
                ) : (
                  "Your email address has been verified successfully."
                )}
              </p>
              <p className="text-sm text-tertiary">
                You will now receive notifications at this email address.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-negative/10">
              <XCircle className="h-8 w-8 text-negative" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-primary">
                Verification Failed
              </h1>
              <p className="text-secondary">
                {error === "expired" &&
                  "This verification link has expired. Please request a new one."}
                {error === "used" &&
                  "This verification link has already been used."}
                {error === "invalid" &&
                  "This verification link is invalid. Please request a new one."}
                {!error &&
                  error !== "expired" &&
                  error !== "used" &&
                  error !== "invalid" &&
                  "Something went wrong. Please try again."}
              </p>
            </div>
          </>
        )}

        <Button asChild variant="elevatedOutline">
          <Link to="/notification-preferences">
            Return to Notification Preferences
          </Link>
        </Button>
      </main>
    );
  },
});
