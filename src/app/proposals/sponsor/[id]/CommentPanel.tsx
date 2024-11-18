"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addComment } from "../actions/addComment";
import { useAccount } from "wagmi";
import { ProposalDraftComment } from "@prisma/client";
import { ReplyIcon } from "lucide-react";
import AvatarAddress from "../../draft/components/AvatarAdress";

type ProposalDraftCommentWithChildren = ProposalDraftComment & {
  children: ProposalDraftCommentWithChildren[];
};

function nestComments(
  comments: ProposalDraftComment[]
): ProposalDraftCommentWithChildren[] {
  // First create a map of all comments by their ID
  const commentMap = new Map<number, ProposalDraftCommentWithChildren>();

  // Initialize each comment with an empty children array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // Create the nested structure
  const rootComments: ProposalDraftCommentWithChildren[] = [];

  commentMap.forEach((comment) => {
    if (comment.parent_id === null) {
      // This is a root comment
      rootComments.push(comment);
    } else {
      // This is a child comment, add it to its parent's children array
      const parentComment = commentMap.get(comment.parent_id);
      if (parentComment) {
        parentComment.children?.push(comment);
      }
    }
  });

  return rootComments;
}

const CommentItem = ({
  comment,
  params,
}: {
  comment: ProposalDraftCommentWithChildren;
  params: { id: string };
}) => {
  const [showReply, setShowReply] = useState(false);
  return (
    <div key={comment.id} className="flex flex-col gap-2">
      <AvatarAddress address={comment.author as `0x${string}`} />
      <div className="border-l border-line pl-2 ml-2.5">
        <p className="text-primary">{comment.comment}</p>
        <span
          className="mt-2 text-xs text-tertiary flex flex-row gap-1 items-center group cursor-pointer"
          onClick={() => setShowReply(!showReply)}
        >
          <ReplyIcon className="w-4 h-4" />
          <p className="group-hover:underline">Reply</p>
        </span>
        {showReply && (
          <ReplyForm
            proposalId={params.id}
            commentId={comment.id}
            setShowReply={setShowReply}
          />
        )}
        {comment.children.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {comment.children.map((child) => (
              <CommentItem
                comment={child}
                params={params}
                key={`${child}-${child.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyForm = ({
  proposalId,
  commentId,
  setShowReply,
}: {
  proposalId: string;
  commentId: number;
  setShowReply: (show: boolean) => void;
}) => {
  const { address } = useAccount();
  const { register, watch, handleSubmit } = useForm();
  const reply = watch("reply");

  const onSubmit = (data: any) => {
    if (!address) return;

    addComment({
      proposalId,
      parentId: commentId,
      comment: data.reply,
      address: address!,
    });
  };

  return (
    <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
      <Textarea placeholder="Post a reply..." {...register("reply")} />
      <div className="flex flex-row gap-2 items-center mt-2">
        <Button type="submit" className="w-fit">
          Post
        </Button>
        <span
          className="hover:underline text-sm text-tertiary cursor-pointer font-semibold"
          onClick={() => setShowReply(false)}
        >
          Cancel
        </span>
      </div>
    </form>
  );
};

const CommentPanel = ({
  comments,
  params,
}: {
  comments: ProposalDraftComment[];
  params: { id: string };
}) => {
  const nestedComments = nestComments(comments);
  const { address } = useAccount();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const comment = watch("comment");
  const onSubmit = (data: any) => {
    if (!address) return;

    addComment({
      proposalId: params.id,
      comment: data.comment,
      address: address!,
    });
  };

  return (
    <>
      <h3 className="font-black text-primary mt-6">Discussion</h3>
      <div className="space-y-2 mt-4">
        {nestedComments.map((comment) => (
          <CommentItem
            comment={comment}
            params={params}
            key={`${comment}-${comment.id}`}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-2">
        <Textarea placeholder="Add a comment..." {...register("comment")} />
        {comment && (
          <Button type="submit" className="w-fit">
            Post
          </Button>
        )}
      </form>
    </>
  );
};

export default CommentPanel;
