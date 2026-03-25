import { Metadata } from "next";
import { notFound } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { fetchSubmissionById } from "@/app/api/common/contest/getSubmissions";
import SubmissionDetailClient from "./SubmissionDetailClient";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const submission = await fetchSubmissionById(id);
  const metadataBase = getMetadataBaseUrl();

  if (!submission) {
    return {
      metadataBase,
      title: "Submission Not Found",
    };
  }

  return {
    metadataBase,
    title: `${submission.title} | Novo Origo Prize`,
    description: submission.contentMarkdown.substring(0, 200),
    openGraph: {
      type: "article",
      title: submission.title,
      description: submission.contentMarkdown.substring(0, 200),
    },
  };
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { namespace, ui } = Tenant.current();
  const { id } = await params;

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

  const submission = await fetchSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return <SubmissionDetailClient submission={submission} />;
}
