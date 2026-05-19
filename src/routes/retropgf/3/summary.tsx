/*
 * TanStack Start port of src/app/retropgf/3/summary/page.tsx.
 * URL: /retropgf/3/summary
 */

import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { HStack, VStack } from "@/components/Layout/Stack";
import badge from "@/icons/badge.svg";
import sunny from "@/icons/sunny.svg";

export const Route = createFileRoute("/retropgf/3/summary")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("retropgf")?.enabled) {
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
  component: function RetroPGFSummaryPage() {
    return (
      <VStack gap={6} className="mt-12">
        <h1 className="text-2xl font-extrabold text-primary">
          RetroPGF Round 3 Summary
        </h1>
        <HStack gap={4}>
          <img src={badge} alt="badge" width={24} height={24} />
          <img src={sunny} alt="sunny" width={24} height={24} />
        </HStack>
        <p className="text-secondary">
          Round 3 results are now final.{" "}
          <Link to="/retropgf/3" className="text-primary underline">
            View all projects
          </Link>
        </p>
      </VStack>
    );
  },
});
