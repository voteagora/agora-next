import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import CivicOnboardingClient from "./CivicOnboardingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to CIVIC",
  description: "Set up your profile and help choose CIVIC’s next briefing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CivicOnboardingPage() {
  const { namespace, ui } = Tenant.current();

  if (
    namespace !== TENANT_NAMESPACES.CIVIC ||
    !ui.toggle("forums/surveys")?.enabled
  ) {
    notFound();
  }

  return <CivicOnboardingClient />;
}
