import { formatDistanceToNow } from "date-fns";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { CreatePostClient } from "./components/CreatePostClient";
import { PostType, CreatePostFormData, ProposalType } from "./types";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";

function getInitialPostType(searchParams: {
  [key: string]: string | string[] | undefined;
}): PostType {
  const type = searchParams.type as PostType;
  return type && ["forum-post", "tempcheck", "gov-proposal"].includes(type)
    ? type
    : "forum-post";
}

function getInitialFormData(searchParams: {
  [key: string]: string | string[] | undefined;
}): Partial<CreatePostFormData> {
  const fromTopicId = searchParams.fromTopicId as string | undefined;
  const fromTopicSlug = searchParams.fromTopicSlug as string | undefined;
  const fromTempCheckId = searchParams.fromTempCheckId as string | undefined;
  const fromTempCheckSlug = searchParams.fromTempCheckSlug as
    | string
    | undefined;
  const titleParam = searchParams.title as string | undefined;
  const descriptionParam = searchParams.description as string | undefined;
  const createdAtParam = searchParams.createdAt as string | undefined;
  const commentsCountParam = searchParams.commentsCount as string | undefined;

  const data: Partial<CreatePostFormData> = {
    title: titleParam || "",
    description: descriptionParam || "",
    relatedDiscussions: [],
    relatedTempChecks: [],
  };

  if (fromTopicId && titleParam) {
    data.relatedDiscussions = [
      {
        id: fromTopicId,
        title: titleParam,
        description: descriptionParam || "",
        comments: commentsCountParam ? parseInt(commentsCountParam, 10) : 0,
        timestamp: formatDistanceToNow(
          new Date(createdAtParam || new Date().toISOString()),
          { addSuffix: true }
        ),
        url: buildForumTopicPath(
          Number(fromTopicId),
          fromTopicSlug || titleParam
        ),
      },
    ];
  }

  if (fromTempCheckId && titleParam) {
    data.relatedTempChecks = [
      {
        id: fromTempCheckId,
        title: titleParam,
        description: descriptionParam || "",
        comments: commentsCountParam ? parseInt(commentsCountParam, 10) : 0,
        timestamp: formatDistanceToNow(
          new Date(createdAtParam || new Date().toISOString()),
          { addSuffix: true }
        ),
        url: buildForumTopicPath(
          Number(fromTempCheckId),
          fromTempCheckSlug || titleParam
        ),
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
  const params = await searchParams;
  const initialPostType = getInitialPostType(params);
  const initialFormData = getInitialFormData(params);

  // Fetch proposal types on the server
  const proposalTypesData = await fetchProposalTypes();
  const proposalTypes: ProposalType[] = Array.isArray(proposalTypesData)
    ? proposalTypesData.map((type) => ({
        id: type.proposal_type_id,
        name: type.name,
        description: type.description,
        quorum: type.quorum,
        approvalThreshold: type.approval_threshold,
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

  return (
    <CreatePostClient
      initialPostType={initialPostType}
      initialFormData={initialFormData}
      proposalTypes={proposalTypes}
    />
  );
}
