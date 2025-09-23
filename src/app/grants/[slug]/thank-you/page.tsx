import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

// Mock grants data - will be replaced with database calls later
const mockGrants = [
  {
    id: "marketing-grants",
    title: "Marketing and Events Grants",
    description:
      "Support marketing initiatives and community events for the Syndicate Network ecosystem",
    slug: "marketing-and-events-grants",
    active: true,
    budget: "$50,000",
    deadline: "December 31, 2024",
  },
  {
    id: "builder-grants",
    title: "Builder Grants",
    description:
      "Fund development projects and technical contributions to the Syndicate Network",
    slug: "builder-grants",
    active: true,
    budget: "$100,000",
    deadline: "December 31, 2024",
  },
  {
    id: "research-grants",
    title: "Research and Development Grants",
    description:
      "Support research initiatives and academic contributions to blockchain technology",
    slug: "research-and-development-grants",
    active: true,
    budget: "$75,000",
    deadline: "January 15, 2025",
  },
];

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const grant = mockGrants.find((g) => g.slug === params.slug);

  if (!grant) {
    return {
      title: "Grant Not Found",
      description: "The requested grant could not be found.",
    };
  }

  return {
    title: `Application Submitted - ${grant.title}`,
    description: `Thank you for submitting your application for ${grant.title}`,
    robots: "noindex, nofollow", // Don't index thank you pages
  };
}

export default async function ThankYouPage({
  params,
}: {
  params: { slug: string };
}) {
  const { ui } = Tenant.current();

  if (!ui.toggle("grants") || !ui.toggle("grants/intake-form")) {
    return <div>Route not supported for namespace</div>;
  }

  const grant = mockGrants.find((g) => g.slug === params.slug);

  if (!grant || !grant.active) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col max-w-[76rem] mt-12 mb-0 sm:my-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Thank You Message */}
          <h1 className="text-primary text-3xl font-extrabold mb-4">
            Application Submitted Successfully!
          </h1>

          <p className="text-tertiary text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Thank you for submitting your application for the{" "}
            <span className="font-semibold text-primary">{grant.title}</span>.
            Your application has been received and is now under review.
          </p>

          {/* Important Information */}
          <div className="bg-white border border-line rounded-lg p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-primary mb-4">
              What happens next?
            </h2>

            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-primary mb-1">
                    Review Process
                  </h3>
                  <p className="text-tertiary text-sm">
                    Our grants committee will review your application within 2-3
                    weeks.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-primary mb-1">
                    Email Notification
                  </h3>
                  <p className="text-tertiary text-sm">
                    You&apos;ll receive an email with the decision and next
                    steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-primary mb-1">
                    Privacy Protection
                  </h3>
                  <p className="text-tertiary text-sm">
                    Your application remains private until accepted. Only
                    successful applications become public.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/grants"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              View All Grants
            </Link>

            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-line text-primary rounded-md hover:bg-wash transition-colors font-medium"
            >
              Return to Home
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-12 pt-8 border-t border-line">
            <div className="bg-wash rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-primary mb-3">Need Help?</h3>
              <p className="text-sm text-tertiary mb-4">
                If you have any questions about your application or the grants
                process, please don&apos;t hesitate to reach out to our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:grants@syndicatecollective.io"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  📧 grants@syndicatecollective.io
                </a>
                <a
                  href="https://discord.gg/syndicate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  💬 Discord Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
