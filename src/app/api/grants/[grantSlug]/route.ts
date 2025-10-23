import { NextRequest, NextResponse } from "next/server";
import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { grantSlug: string } }
) {
  try {
    // Return hardcoded grant until database migration is deployed
    const mockGrants = [
      {
        id: "marketing-events",
        title: "Marketing & Events",
        description:
          "Support for marketing campaigns, conferences, meetups, and community events that promote Syndicate Network adoption.",
        slug: "marketing-events",
        active: true,
        budgetRange: "$5,000 - $25,000",
        deadline: "December 31, 2024",
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
      },
    ];

    const grant = mockGrants.find((g) => g.slug === params.grantSlug);

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json(grant, { status: 200 });
  } catch (error) {
    console.error("Error fetching grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant" },
      { status: 500 }
    );
  }
}
