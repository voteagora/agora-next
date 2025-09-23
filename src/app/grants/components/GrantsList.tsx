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

export default function GrantsList() {
  const { ui } = Tenant.current();

  if (!ui.toggle("grants/intake-form")) {
    return (
      <div className="text-center py-8">
        <p className="text-tertiary">
          Grants intake form is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-tertiary mb-6">
        <p>
          Apply for grants to support the Syndicate Network ecosystem. All
          applications are private until accepted.
        </p>
      </div>

      <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
        <div>
          {mockGrants.length === 0 ? (
            <div className="flex flex-row justify-center py-8 text-secondary">
              No grants currently available
            </div>
          ) : (
            <div>
              {mockGrants.map((grant, index) => (
                <div
                  key={grant.id}
                  className={`border-b border-line last:border-b-0 ${
                    index === 0 ? "rounded-t-lg" : ""
                  } ${index === mockGrants.length - 1 ? "rounded-b-lg" : ""}`}
                >
                  <div className="p-6 hover:bg-wash/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          {grant.title}
                        </h3>
                        <p className="text-tertiary mb-4 text-sm leading-relaxed">
                          {grant.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary">Budget:</span>
                            <span className="font-medium text-primary">
                              {grant.budget}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary">Deadline:</span>
                            <span className="font-medium text-primary">
                              {grant.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Link
                          href={`/grants/${grant.slug}`}
                          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
