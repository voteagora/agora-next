/*
 * TanStack Start port of src/app/retropgf/3/application/[id]/page.tsx.
 * URL: /retropgf/3/application/:id
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import RetroPGFApplicationBanner from "@/components/RetroPGF/RetroPGFApplicationBanner";
import RetroPGFApplicationContent from "@/components/RetroPGF/RetroPGFApplicationContent";

export const Route = createFileRoute("/retropgf/3/application/$id")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("retropgf")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Agora - Optimism's RetroPGF Round 3 Summary" },
      {
        name: "description",
        content:
          "See which of your favourite projects were allocated in Optimism's RetroPGF Round 3.",
      },
    ],
  }),
  loader: async ({ params }) => {
    const { getResultsProjectId } = await import("@/app/retropgf/actions");
    const retroPGFProject = await getResultsProjectId(params.id);
    if (!retroPGFProject) {
      throw redirect({ to: "/retropgf/3" });
    }
    return { retroPGFProject };
  },
  component: function RetroPGFApplicationPage() {
    const { retroPGFProject } = Route.useLoaderData();
    return (
      <div className="mt-8">
        <RetroPGFApplicationBanner retroPGFProject={retroPGFProject} />
        <RetroPGFApplicationContent retroPGFProject={retroPGFProject} />
      </div>
    );
  },
});
