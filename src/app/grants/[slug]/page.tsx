import { notFound } from "next/navigation";
import { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import GrantIntakeForm from "./components/GrantIntakeForm";

interface Grant {
  id: string;
  title: string;
  description: string;
  slug: string;
  active: boolean;
  budgetRange: string;
  deadline: string;
  requirements: string[];
}

// Mock grants data - 11 categories with unique requirements
const mockGrants: Grant[] = [
  {
    id: "marketing-events",
    title: "Marketing & Events",
    description:
      "Support for marketing campaigns, conferences, meetups, and community events that promote Syndicate Network adoption.",
    slug: "marketing-events",
    active: true,
    budgetRange: "$5,000 - $25,000",
    deadline: "December 31, 2024",
    requirements: [
      "Must be a member of the Syndicate Network community",
      "Event must benefit the broader ecosystem",
      "Clear marketing strategy and budget breakdown",
      "Expected attendance and engagement metrics",
    ],
  },
  {
    id: "development-tools",
    title: "Development & Tools",
    description:
      "Funding for building developer tools, SDKs, APIs, and infrastructure that enhances the Syndicate ecosystem.",
    slug: "development-tools",
    active: true,
    budgetRange: "$10,000 - $50,000",
    deadline: "December 31, 2024",
    requirements: [
      "Technical project with clear deliverables",
      "Open source or public good focus",
      "Demonstrable impact on Syndicate Network",
      "Experienced team with proven track record",
    ],
  },
  {
    id: "research-analysis",
    title: "Research & Analysis",
    description:
      "Support for research projects, market analysis, technical studies, and academic papers related to Syndicate Network.",
    slug: "research-analysis",
    active: true,
    budgetRange: "$3,000 - $15,000",
    deadline: "December 31, 2024",
    requirements: [
      "Academic or research institution affiliation",
      "Peer-reviewed research methodology",
      "Publication in academic journals",
      "Open access to research findings",
    ],
  },
  {
    id: "community-building",
    title: "Community Building",
    description:
      "Grants for community management, ambassador programs, and initiatives that grow and engage the Syndicate community.",
    slug: "community-building",
    active: true,
    budgetRange: "$2,000 - $20,000",
    deadline: "December 31, 2024",
    requirements: [
      "Proven community management experience",
      "Clear growth and engagement strategy",
      "Regional or demographic focus",
      "Measurable community metrics",
    ],
  },
  {
    id: "education-content",
    title: "Education & Content",
    description:
      "Funding for educational content, tutorials, documentation, courses, and learning resources about Syndicate Network.",
    slug: "education-content",
    active: true,
    budgetRange: "$1,000 - $10,000",
    deadline: "December 31, 2024",
    requirements: [
      "High-quality educational content",
      "Clear learning objectives",
      "Accessible to target audience",
      "Distribution and promotion plan",
    ],
  },
  {
    id: "security-audits",
    title: "Security & Audits",
    description:
      "Support for security audits, bug bounty programs, and security-focused development of Syndicate protocols.",
    slug: "security-audits",
    active: true,
    budgetRange: "$15,000 - $75,000",
    deadline: "December 31, 2024",
    requirements: [
      "Certified security audit firm",
      "Comprehensive audit methodology",
      "Detailed security report",
      "Follow-up remediation plan",
    ],
  },
  {
    id: "integration-partnerships",
    title: "Integration & Partnerships",
    description:
      "Grants for integrating Syndicate with other protocols, platforms, and strategic partnerships.",
    slug: "integration-partnerships",
    active: true,
    budgetRange: "$5,000 - $30,000",
    deadline: "December 31, 2024",
    requirements: [
      "Established partnership agreement",
      "Technical integration plan",
      "Mutual benefit demonstration",
      "Long-term sustainability plan",
    ],
  },
  {
    id: "governance-participation",
    title: "Governance Participation",
    description:
      "Support for governance participation, voting mechanisms, and democratic processes within Syndicate Network.",
    slug: "governance-participation",
    active: true,
    budgetRange: "$1,000 - $5,000",
    deadline: "December 31, 2024",
    requirements: [
      "Active governance participation",
      "Community engagement strategy",
      "Democratic process improvement",
      "Transparency and accountability",
    ],
  },
  {
    id: "sustainability-environmental",
    title: "Sustainability & Environmental",
    description:
      "Funding for projects that promote environmental sustainability, carbon reduction, and green technology initiatives.",
    slug: "sustainability-environmental",
    active: true,
    budgetRange: "$3,000 - $25,000",
    deadline: "December 31, 2024",
    requirements: [
      "Environmental impact measurement",
      "Carbon reduction methodology",
      "Sustainability metrics",
      "Long-term environmental benefits",
    ],
  },
  {
    id: "accessibility-inclusion",
    title: "Accessibility & Inclusion",
    description:
      "Grants for making Syndicate Network more accessible to underrepresented communities and promoting diversity.",
    slug: "accessibility-inclusion",
    active: true,
    budgetRange: "$2,000 - $15,000",
    deadline: "December 31, 2024",
    requirements: [
      "Diversity and inclusion focus",
      "Accessibility improvements",
      "Community outreach plan",
      "Measurable inclusion metrics",
    ],
  },
  {
    id: "innovation-prototyping",
    title: "Innovation & Prototyping",
    description:
      "Support for experimental projects, proof-of-concepts, and innovative applications of Syndicate technology.",
    slug: "innovation-prototyping",
    active: true,
    budgetRange: "$5,000 - $40,000",
    deadline: "December 31, 2024",
    requirements: [
      "Novel technical approach",
      "Proof-of-concept demonstration",
      "Innovation impact assessment",
      "Future development roadmap",
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
              <p className="text-2xl font-bold text-primary">
                {grant.budgetRange}
              </p>
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
