import { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import NewSubmissionClient from "./NewSubmissionClient";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = getMetadataBaseUrl();

  return {
    metadataBase,
    title: "Submit Your Design | Novo Origo Prize",
    description: "Submit your governance design proposal for the $15K prize",
    openGraph: {
      type: "website",
      title: "Submit Your Design | Novo Origo Prize",
      description: "Submit your governance design proposal for the $15K prize",
    },
  };
}

export default function NewSubmissionPage() {
  const { namespace, ui } = Tenant.current();

  if (namespace !== TENANT_NAMESPACES.CONTEST) {
    return (
      <div className="text-primary p-8">
        This page is only available for the contest tenant.
      </div>
    );
  }

  if (!ui.toggle("submissions")?.enabled) {
    return <div className="text-primary p-8">Submissions are not enabled.</div>;
  }

  return <NewSubmissionClient />;
}
