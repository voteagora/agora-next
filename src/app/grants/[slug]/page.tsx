import { notFound } from "next/navigation";
import { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import GrantIntakeForm from "./components/GrantIntakeForm";

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
    requirements: [
      "Must be a member of the Syndicate Network community",
      "Project must benefit the broader ecosystem",
      "Clear budget breakdown required",
      "Timeline and deliverables specified",
    ],
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
    requirements: [
      "Technical project with clear deliverables",
      "Open source or public good focus",
      "Demonstrable impact on Syndicate Network",
      "Experienced team with proven track record",
    ],
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
    requirements: [
      "Academic or research institution affiliation",
      "Peer-reviewed research methodology",
      "Publication in academic journals",
      "Open access to research findings",
    ],
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
    title: `${grant.title} - Syndicate Grants Program`,
    description: grant.description,
    openGraph: {
      title: `${grant.title} - Syndicate Grants Program`,
      description: grant.description,
      type: "website",
      url: `https://syndicatecollective.io/grants/${grant.slug}`,
      siteName: "Syndicate Network Collective",
      images: [
        {
          url: "https://syndicatecollective.io/images/og-grant-generic.png",
          width: 1200,
          height: 630,
          alt: `${grant.title} - Syndicate Grants Program`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${grant.title} - Syndicate Grants Program`,
      description: grant.description,
      images: ["https://syndicatecollective.io/images/og-grant-generic.png"],
    },
  };
}

export default async function GrantPage({
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
        <div className="mb-8">
          <h1 className="text-primary text-3xl font-extrabold mb-4">
            {grant.title}
          </h1>
          <p className="text-tertiary text-lg mb-6 leading-relaxed">
            {grant.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-line rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">Budget</h3>
              <p className="text-2xl font-bold text-primary">{grant.budget}</p>
            </div>
            <div className="bg-white border border-line rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">
                Application Deadline
              </h3>
              <p className="text-lg font-medium text-primary">
                {grant.deadline}
              </p>
            </div>
          </div>

          <div className="bg-white border border-line rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-primary mb-4">Requirements</h3>
            <ul className="space-y-2">
              {grant.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-tertiary">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <GrantIntakeForm grant={grant} />
      </div>
    </div>
  );
}
