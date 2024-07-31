import React from "react";
import { VStack } from "@/components/Layout/Stack";
import Link from "next/link";

function VoteDetailsContainer({
  children,
  proposalId,
}: {
  children: React.ReactNode;
  proposalId: string;
}) {
  return (
    <Link
      href={`/proposals/${proposalId}`}
      title={`Prop ${proposalId}`}
      className="block"
    >
      <VStack gap={3}>{children}</VStack>
    </Link>
  );
}

export default VoteDetailsContainer;
