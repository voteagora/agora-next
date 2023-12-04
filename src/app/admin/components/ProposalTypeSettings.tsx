"use client";

import { Separator } from "@/components/ui/separator";
import ProposalType from "./ProposalType";
import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const mockProposalTypes = [
  { quorum: 1000, approvalThreshold: 1000, name: "Default" },
  { quorum: 2000, approvalThreshold: 2000, name: "Alt" },
];

// TODO: Take init values from the chain
export default function ProposalTypeSettings() {
  const [proposalTypes, setProposalTypes] = useState(
    mockProposalTypes.map(({ quorum, approvalThreshold, name }) => ({
      name,
      quorum: quorum / 100,
      approvalThreshold: approvalThreshold / 100,
    }))
  );

  return (
    <section className="gl_box">
      <h1 className="font-extrabold text-2xl">Proposal type settings</h1>
      <p>Create and manage different types of proposals</p>
      {proposalTypes.map((proposalType, key) => (
        <Fragment key={key}>
          <ProposalType proposalType={proposalType} index={key} />
          <Separator className="my-8" />
        </Fragment>
      ))}
      <div
        className="inline-flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setProposalTypes((prev) => [
            ...prev,
            { quorum: 50, approvalThreshold: 50, name: "" },
          ]);
        }}
      >
        <Button
          size="icon"
          className="w-8 h-8 rounded-full"
          variant="secondary"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
        <p className="text-sm">Add another proposal type</p>
      </div>
    </section>
  );
}
