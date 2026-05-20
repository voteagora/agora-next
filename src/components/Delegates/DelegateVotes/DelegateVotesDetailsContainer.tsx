import React from "react";
import { VStack } from "@/components/Layout/Stack";
import { Link } from "@tanstack/react-router";

function VoteDetailsContainer({
  children,
  proposalId,
}: {
  children: React.ReactNode;
  proposalId: string;
}) {
  return (
    <Link
      to={`/proposals/${proposalId}` as never}
      title={`Prop ${proposalId}`}
      className="block"
    >
      <VStack gap={3}>{children}</VStack>
    </Link>
  );
}

export default VoteDetailsContainer;
