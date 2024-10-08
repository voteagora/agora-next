"use client";

import { Separator } from "@/components/ui/separator";
import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimismProposalTypes } from "@prisma/client";
import ProposalType from "./ProposalType";

// TODO: Take init values from the chain
export default function ProposalTypeSettings({
  votableSupply,
  proposalTypes,
}: {
  votableSupply: string;
  proposalTypes: OptimismProposalTypes[];
}) {
  const fmtPropTypes = proposalTypes.map(
    ({ quorum, approval_threshold, name }) => ({
      name,
      quorum: Number(quorum) / 100,
      approval_threshold: Number(approval_threshold) / 100,
    })
  );

  const [propTypes, setPropTypes] = useState(fmtPropTypes);

  return (
    <section className="gl_box bg-neutral">
      <h1 className="font-extrabold text-2xl text-primary">
        Proposal type settings
      </h1>
      <p>Create and manage different types of proposals</p>

      {propTypes.map((proposalType, key) => (
        <Fragment key={key}>
          <ProposalType
            votableSupply={votableSupply}
            proposalType={proposalType}
            index={key}
          />
          <Separator className="my-8" />
        </Fragment>
      ))}

      <div
        className="inline-flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setPropTypes((prevPropTypes) => [
            ...prevPropTypes,
            { quorum: 50, approval_threshold: 50, name: "" },
          ]);
        }}
      >
        <Button
          size="icon"
          className="w-8 h-8 rounded-full"
          variant="secondary"
        >
          <Plus className="w-3.5 h-3.5 text-neutral" />
        </Button>
        <p className="text-sm">Add another proposal type</p>
      </div>
    </section>
  );
}
