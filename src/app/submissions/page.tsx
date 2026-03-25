import { Metadata } from "next";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { fetchSubmissions } from "@/app/api/common/contest/getSubmissions";
import SubmissionsListClient from "./SubmissionsListClient";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = Tenant.current();
  const page = tenant.ui.page("submissions") || tenant.ui.page("/");
  const { title, description } = page?.meta || {
    title: "Submissions",
    description: "Browse contest submissions",
  };
  const metadataBase = getMetadataBaseUrl();

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
    },
  };
}

export default async function SubmissionsPage() {
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

  const submissions = await fetchSubmissions({
    sort: "submitted_at",
    order: "desc",
  });

  return <SubmissionsListClient initialSubmissions={submissions} />;
}
