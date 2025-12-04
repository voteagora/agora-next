import { formatDistanceToNow } from "date-fns";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { CreatePostClient } from "./components/CreatePostClient";
import { PostType, CreatePostFormData, ProposalType } from "./types";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { fetchProposalFromArchive } from "@/lib/archiveUtils";
import { getForumTopic } from "@/lib/actions/forum/topics";
import Tenant from "@/lib/tenant/tenant";

const { namespace, ui } = Tenant.current();

function getInitialPostType(searchParams: {
  [key: string]: string | string[] | undefined;
}): PostType {
  const type = searchParams.type as PostType;
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

    const proposalType = fetchedProposal.proposal_type;
    const proposalTypeData =
      proposalType &&
      typeof proposalType === "object" &&
      "quorum" in proposalType
        ? {
            id: proposalType.eas_uid,
            name: proposalType.name,
            description: proposalType.description,
            quorum: proposalType.quorum / 100,
            approvalThreshold: proposalType.approval_threshold / 100,
          }
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
        status: fetchedProposal.lifecycle_stage,
        proposer: fetchedProposal.proposer,
        proposalType: proposalTypeData,
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

  if (tempCheckProposal?.proposal_type && initialPostType === "gov-proposal") {
    const proposalType = tempCheckProposal.proposal_type;

    if (typeof proposalType === "object" && "quorum" in proposalType) {
      proposalTypes = [
        {
          id: proposalType.eas_uid,
          name: proposalType.name,
          description: proposalType.description,
          quorum: proposalType.quorum / 100,
          approvalThreshold: proposalType.approval_threshold / 100,
        },
      ];
    }
  }

  // Fallback: fetch all proposal types if not from temp check or if fetch failed
  if (proposalTypes.length === 0) {
    const proposalTypesData = await fetchProposalTypes();
    proposalTypes = Array.isArray(proposalTypesData)
      ? proposalTypesData.map((type) => ({
          id: type.proposal_type_id,
          name: type.name,
          description: type.description,
          quorum: type.quorum / 100,
          approvalThreshold: type.approval_threshold / 100,
        }))
      : [
          {
            id: "none",
            name: "None",
            description: "No proposal type created yet",
            quorum: 0,
            approvalThreshold: 0,
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
