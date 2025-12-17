import { notFound } from "next/navigation";
import { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import GrantIntakeForm from "./components/GrantIntakeForm";
import { getGrant } from "@/app/api/common/grants/getGrant";

interface Grant {
  id: string;
  title: string;
  description: string;
  slug: string;
  active: boolean;
  budgetRange?: string | null;
  deadline?: string | null;
  form_schema?: any;
  bottom_text_config?: {
    type: "text" | "confirmation";
    content?: string;
    items?: Array<{
      id: string;
      text: string;
      required: boolean;
    }>;
  } | null;
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const grantData = await getGrant(params.slug);

  if (!grantData) {
    return {
      title: "Grant Not Found",
      description: "The requested grant could not be found.",
    };
  }

  const { ui } = Tenant.current();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://syndicatecollective.io";

  return {
    title: `${grantData.title} - Grants Program`,
    description: grantData.description,
    openGraph: {
      title: `${grantData.title} - Grants Program`,
      description: grantData.description,
      type: "website",
      url: `${baseUrl}/grants/${grantData.slug}`,
      siteName: "Grants Program",
      images: [
        {
          url: `${baseUrl}/images/og-grant-generic.png`,
          width: 1200,
          height: 630,
          alt: `${grantData.title} - Grants Program`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${grantData.title} - Grants Program`,
      description: grantData.description,
      images: [`${baseUrl}/images/og-grant-generic.png`],
    },
  };
}

export default async function GrantPage({
  params,
}: {
  params: { slug: string };
}) {
  const { ui, slug } = Tenant.current();

  if (!ui.toggle("grants") || !ui.toggle("grants/intake-form")) {
    return <div>Route not supported for namespace</div>;
  }

  const grantData = await getGrant(params.slug);

  if (!grantData || !grantData.active) {
    notFound();
  }

  // Transform database grant to frontend format
  // Parse bottom_text_config if it's a string (JSONB from database)
  let bottomTextConfig = grantData.bottom_text_config;
  if (typeof bottomTextConfig === "string") {
    try {
      bottomTextConfig = JSON.parse(bottomTextConfig);
    } catch (e) {
      console.error("Failed to parse bottom_text_config:", e);
      bottomTextConfig = null;
    }
  }

  // Parse form_schema if it's a string
  let formSchema = grantData.form_schema;
  if (typeof formSchema === "string") {
    try {
      formSchema = JSON.parse(formSchema);
    } catch (e) {
      console.error("Failed to parse form_schema:", e);
      formSchema = [];
    }
  }

  const grant: Grant = {
    id: grantData.id,
    title: grantData.title,
    description: grantData.description,
    slug: grantData.slug,
    active: grantData.active,
    budgetRange: grantData.budget_range || null,
    deadline: grantData.deadline
      ? new Date(grantData.deadline).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null,
    form_schema: formSchema || [],
    bottom_text_config: bottomTextConfig || null,
  };

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

          {(grant.budgetRange || grant.deadline) && (
            <div
              className={`grid gap-6 mb-8 ${grant.budgetRange && grant.deadline ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
            >
              {grant.budgetRange && (
                <div className="bg-white border border-line rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">Budget</h3>
                  <p className="text-2xl font-bold text-primary">
                    {grant.budgetRange}
                  </p>
                </div>
              )}
              {grant.deadline && (
                <div className="bg-white border border-line rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">
                    Application Deadline
                  </h3>
                  <p className="text-lg font-medium text-primary">
                    {grant.deadline}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <GrantIntakeForm grant={grant} />
      </div>
    </div>
  );
}
