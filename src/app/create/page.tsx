import { formatDistanceToNow } from "date-fns";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { CreatePostClient } from "./components/CreatePostClient";
import { PostType, CreatePostFormData } from "./types";

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

  return (
    <CreatePostClient
      initialPostType={initialPostType}
      initialFormData={initialFormData}
    />
  );
}
