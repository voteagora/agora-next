import { formatDistanceToNow } from "date-fns";
import {
  extractAuthoringApprovalData,
  normalizeAuthoringProposalTypeConfig,
  normalizeAuthoringVotingType,
} from "@/features/proposals/authoring/shared";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { getForumTopic } from "@/lib/actions/forum/topics";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { deriveStatus } from "@/lib/proposals";
import Tenant from "@/lib/tenant/tenant";
import { AuthoringEntryType, CreatePostFormData, ProposalType } from "./types";
import { CreatePostClient } from "./components/CreatePostClient";

const { namespace, ui } = Tenant.current();

function getInitialPostType(searchParams: {
  [key: string]: string | string[] | undefined;
}): AuthoringEntryType {
  const type = searchParams.type as AuthoringEntryType;
  return type && ["tempcheck", "gov-proposal"].includes(type)
    ? type
    : "tempcheck";
}

async function getInitialFormData(
  searchParams: {
    [key: string]: string | string[] | undefined;
  },
  fetchedProposal?: any
): Promise<Partial<CreatePostFormData>> {
  const fromTopicId = searchParams.fromTopicId as string | undefined;
  const fromTempCheckId = searchParams.fromTempCheckId as string | undefined;

  const data: Partial<CreatePostFormData> = {
    title: "",
    description: "",
    relatedDiscussions: [],
    relatedTempChecks: [],
  };

  if (fromTopicId) {
    const topicResult = await getForumTopic(Number(fromTopicId));
    if (topicResult.success && topicResult.data) {
      const topic = topicResult.data;
      const firstPost = topic.posts?.[0];
      data.relatedDiscussions = [
        {
          id: fromTopicId,
          title: topic.title,
          description: firstPost?.content || "",
          comments: topic.posts?.length || 0,
          timestamp: formatDistanceToNow(new Date(topic.createdAt), {
            addSuffix: true,
          }),
          url: buildForumTopicPath(Number(fromTopicId), topic.title),
        },
      ];
    }
  }

  if (fromTempCheckId && fetchedProposal) {
    data.title = fetchedProposal.title || "";
    data.description = fetchedProposal.description || "";

    const approvalData =
      normalizeAuthoringVotingType(fetchedProposal?.voting_module) ===
      "approval"
        ? extractAuthoringApprovalData(fetchedProposal)
        : undefined;

    data.relatedTempChecks = [
      {
        id: fromTempCheckId,
        title: fetchedProposal.title || "",
        description: fetchedProposal.description || "",
        comments: 0,
        timestamp: formatDistanceToNow(
          new Date(fetchedProposal.start_blocktime * 1000 || new Date()),
          { addSuffix: true }
        ),
        url: `/proposals/${fromTempCheckId}`,
        status: deriveStatus(fetchedProposal, 18),
        proposer: fetchedProposal.proposer,
        approvalData,
        votingModule: fetchedProposal.voting_module,
      },
    ];
  }

  return data;
}

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isEASV2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

  if (!isEASV2Enabled) {
    return null;
  }

  const params = await searchParams;
  const initialPostType = getInitialPostType(params);
  const fromTempCheckId = params.fromTempCheckId as string | undefined;

  let tempCheckProposal;
  if (fromTempCheckId) {
    tempCheckProposal = await fetchProposalFromArchive(
      namespace,
      fromTempCheckId
    );
  }

  const initialFormData = await getInitialFormData(params, tempCheckProposal);

  let proposalTypes: ProposalType[] = [];

  if (proposalTypes.length === 0) {
    const proposalTypesData = await fetchProposalTypes();
    proposalTypes = Array.isArray(proposalTypesData)
      ? proposalTypesData.map((type) =>
          normalizeAuthoringProposalTypeConfig({
            id: type.proposal_type_id,
            name: type.name,
            description: type.description,
            quorum: type.quorum,
            approvalThreshold: type.approval_threshold,
            module: type.module,
          })
        )
      : [
          {
            id: "none",
            name: "None",
            description: "No proposal type created yet",
            quorum: 0,
            approvalThreshold: 0,
            module: "STANDARD",
          },
        ];
  }

  return (
    <CreatePostClient
      initialPostType={initialPostType}
      initialFormData={initialFormData}
      proposalTypes={proposalTypes}
    />
  );
}
