/*
 * TanStack Start port of src/app/grants/[slug]/page.tsx.
 * URL: /grants/:slug
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import GrantIntakeForm from "@/components/Grants/GrantIntakeForm";

const serverGetGrant = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getGrant } = await import("@/app/api/common/grants/getGrant");
    const grant = await getGrant(data.slug);

    if (!grant) {
      return null;
    }

    return {
      id: grant.id,
      title: grant.title,
      description: grant.description,
      slug: grant.slug,
      active: grant.active,
      budgetRange: grant.budget_range || "TBD",
      deadline: grant.deadline
        ? new Date(grant.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No deadline",
      form_schema: grant.form_schema || [],
      bottom_text_config: grant.bottom_text_config || null,
      bottom_text: grant.bottom_text || null,
      category: grant.category || null,
    };
  });

export const Route = createFileRoute("/grants/$slug")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("grants")) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ params }) => {
    const grant = await serverGetGrant({ data: { slug: params.slug } });

    if (!grant) {
      throw redirect({ to: "/grants" });
    }

    return { grant };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.grant?.title ?? "Grant" },
      {
        name: "description",
        content: loaderData?.grant?.description ?? "",
      },
    ],
  }),
  component: function GrantPage() {
    const { grant } = Route.useLoaderData();
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
                className={`grid gap-6 mb-8 ${
                  grant.budgetRange && grant.deadline
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
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

          <GrantIntakeForm grant={grant as never} />
        </div>
      </div>
    );
  },
});
