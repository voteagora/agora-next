import React, { Fragment } from "react";

function ApprovalVoteReason({ params }) {
  return (
    <div className="text-xs text-tertiary font-medium">
      {params?.length > 1 && "Voted: "}
      {params?.map((option, i) => (
        <Fragment key={option}>
          {option}
          {/* add a coma here if not last option */}
          {i !== params.length - 1 && ", "}
        </Fragment>
      ))}
      {(!params || params?.length === 0) && "Abstain"}
    </div>
  );
}

export default ApprovalVoteReason;
