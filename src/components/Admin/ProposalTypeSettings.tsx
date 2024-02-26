"use client";

import { Separator } from "@/components/ui/separator";
import { Fragment, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimismProposalTypes } from "@prisma/client";
import ProposalType from "./ProposalType";
import { fetchProposalTypes } from "@/app/admin/actions";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";

// TODO: Take init values from the chain
export default function ProposalTypeSettings({
  votableSupply,
}: {
  votableSupply: string;
}) {
  const [loading, setLoading] = useState(true);
  const [proposalTypes, setProposalTypes] = useState<
    { name: string; quorum: number; approval_threshold: number }[]
  >([]);

  useEffect(() => {
    const getProposalTypes = async () => {
      const response = (await fetchProposalTypes().catch((error) =>
        console.error(error)
      )) as OptimismProposalTypes[];
      const _proposalTypes = response.map(
        ({ quorum, approval_threshold, name }) => ({
          name,
          quorum: Number(quorum) / 100,
          approval_threshold: Number(approval_threshold) / 100,
        })
      );
      setLoading(false);
      setProposalTypes(_proposalTypes);
    };
    getProposalTypes();
  }, []);

  return (
    <section className="gl_box">
      <h1 className="font-extrabold text-2xl">Proposal type settings</h1>
      <p>Create and manage different types of proposals</p>
      {loading ? (
        <AgoraLoader />
      ) : (
        proposalTypes.map((proposalType, key) => (
          <Fragment key={key}>
            <ProposalType
              votableSupply={votableSupply}
              proposalType={proposalType}
              index={key}
            />
            <Separator className="my-8" />
          </Fragment>
        ))
      )}
      <div
        className="inline-flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setProposalTypes((prev) => [
            ...prev,
            { quorum: 50, approval_threshold: 50, name: "" },
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
