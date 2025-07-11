import { Vote } from "@/app/api/common/votes/vote";
import React, { Fragment } from "react";
import Markdown from "@/components/shared/Markdown/Markdown";

function ApprovalVoteReason({ params }: { params: Vote["params"] }) {
  return (
    <div className="text-xs text-tertiary font-medium">
      {params?.length! > 1 && "Voted: "}
      {params?.map((option: string, i: number) => (
        <Fragment key={option}>
          <Markdown
            content={option}
            className="inline-block p-0 m-0 vote-reason"
            wrapperClassName="inline-block"
          />
          {/* add a comma here if not last option */}
          {i !== params.length - 1 && ", "}
        </Fragment>
      ))}
      {(!params || params?.length === 0) && "Abstain"}
    </div>
  );
}

export default ApprovalVoteReason;
