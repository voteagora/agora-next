"use client";

import { Separator } from "@/components/ui/separator";
import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimismProposalTypes } from "@prisma/client";
import ProposalType from "./ProposalType";
import { useReadContract } from "wagmi";
import ContractList from "@/app/info/components/ContractList";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

// TODO: Take init values from the chain
export default function ProposalTypeSettings({
  votableSupply,
  proposalTypes,
}: {
  votableSupply: string;
  proposalTypes: OptimismProposalTypes[];
}) {
  const { address } = useAccount();
  const { contracts } = Tenant.current();

  const fmtPropTypes = proposalTypes.map(
    ({ quorum, approval_threshold, name }) => ({
      name,
      quorum: Number(quorum) / 100,
      approval_threshold: Number(approval_threshold) / 100,
    })
  );

  const [propTypes, setPropTypes] = useState(fmtPropTypes);

  const { data: adminAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
  }) as { data: `0x${string}` };

  return (
    <section className="gl_box bg-neutral">
      <h1 className="font-extrabold text-2xl text-primary">
        Proposal type settings
      </h1>
      <p>Create and manage different types of proposals</p>
      {!!adminAddress && address !== adminAddress && (
        <div className="text-sm w-full rounded border-2 p-4 bg-negative/10 border-negative text-negative mt-4">
          Only the governor admin address{" "}
          <span className="font-semibold px-1 py-0.5 rounded-lg bg-negative/20">
            {adminAddress}
          </span>{" "}
          can create or update proposal types. You are not currently logged in
          as the admin.
        </div>
      )}

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
