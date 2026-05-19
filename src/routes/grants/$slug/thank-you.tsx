/*
 * TanStack Start port of src/app/grants/[slug]/thank-you/page.tsx.
 * URL: /grants/:slug/thank-you
 */

import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";

export const Route = createFileRoute("/grants/$slug/thank-you")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("grants") || !ui.toggle("grants/intake-form")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Application Submitted - Thank You" },
      {
        name: "description",
        content: "Thank you for submitting your application.",
      },
    ],
  }),
  component: function ThankYouPage() {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col max-w-[76rem] mt-12 mb-0 sm:my-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">
              Application Submitted!
            </h1>
            <p className="text-secondary mb-8 max-w-md mx-auto">
              Thank you for your application. We will review it and get back to
              you as soon as possible.
            </p>
            <Link
              to="/grants"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:opacity-90"
            >
              Back to Grants
            </Link>
          </div>
        </div>
      </div>
    );
  },
});
