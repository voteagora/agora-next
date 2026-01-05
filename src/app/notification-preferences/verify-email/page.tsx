import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    status?: string;
    error?: string;
    email?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status, error, email } = await searchParams;

  const isSuccess = status === "success";

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 pb-16 pt-12 text-center">
      {isSuccess ? (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-positive/10">
            <CheckCircle2 className="h-8 w-8 text-positive" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-primary">Email Verified!</h1>
            <p className="text-secondary">
              {email ? (
                <>
                  Your email address <strong>{email}</strong> has been verified
                  successfully.
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
        <Link href="/notification-preferences">
          Return to Notification Preferences
        </Link>
      </Button>
    </main>
  );
}
