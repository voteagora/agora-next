import ForumNewClient, {
  type FormData,
  type RelatedProposal,
} from "./ForumNewClient";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import Tenant from "@/lib/tenant/tenant";

const { namespace } = Tenant.current();

async function getInitialFormData(searchParams: {
  [key: string]: string | string[] | undefined;
}): Promise<{
  formData: FormData;
  relatedProposal: RelatedProposal | undefined;
}> {
  const fromProposalId = searchParams.fromProposalId as string | undefined;
  const proposalTag = searchParams.proposalTag as string | undefined;

  const formData: FormData = {
    title: "",
    description: "",
    categoryId: undefined,
  };

  let relatedProposal: RelatedProposal | undefined = undefined;

  if (fromProposalId && proposalTag) {
    const fetchedProposal = await fetchProposalFromArchive(
      namespace,
      fromProposalId
    );

    if (fetchedProposal) {
      formData.title = fetchedProposal.title || "";
      formData.description = fetchedProposal.description || "";

      relatedProposal = {
        id: fromProposalId,
        type: proposalTag,
        title: fetchedProposal.title || "",
        description: fetchedProposal.description || "",
        createdAt: new Date(
          fetchedProposal.start_blocktime * 1000 || new Date()
        ).toISOString(),
      };
    }
  }

  return { formData, relatedProposal };
}

export default async function NewForumTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { formData, relatedProposal } = await getInitialFormData(params);

  return (
    <ForumNewClient
      initialFormData={formData}
      relatedProposal={relatedProposal}
    />
  );
}
