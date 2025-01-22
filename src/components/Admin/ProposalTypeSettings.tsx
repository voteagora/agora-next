"use client";

import { Separator } from "@/components/ui/separator";
import { Fragment, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimismProposalTypes } from "@prisma/client";
import ProposalType from "./ProposalType";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const RestrictedCallout = () => {
  const { address, isConnected } = useAccount();
  const { contracts, namespace } = Tenant.current();

  const { data: managerAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "manager",
  }) as { data: `0x${string}` };

  const { data: adminAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
  }) as { data: `0x${string}` };

  const { data: timelockAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "timelock",
  }) as { data: `0x${string}` };

  let addressesToRender = [
    {
      address: timelockAddress,
      label: "Timelock",
    },
  ];

  // OP is is v 0.1 of agora gov and uses a different PTC that is manager and not admin based
  if (namespace === TENANT_NAMESPACES.OPTIMISM) {
    addressesToRender.push({
      address: managerAddress,
      label: "Manager",
    });
  } else {
    addressesToRender.push({
      address: adminAddress,
      label: "Admin",
    });
  }

  if (
    isConnected &&
    !addressesToRender.some((addr) => addr.address === address)
  ) {
    return (
      <div className="text-sm w-[800px] rounded border-2 p-4 bg-negative/10 border-negative text-negative mt-4">
        Only the following addresses can create or update proposal types:
        <ul className="list-disc list-inside">
          {addressesToRender.map((addr) => (
            <li key={addr.address}>
              <span className="font-semibold px-1 py-0.5 rounded-lg bg-negative/20">
                {addr.address}
              </span>{" "}
            </li>
          ))}
        </ul>
        You are not currently logged in as one of the addresses above.
      </div>
    );
  }

  return null;
};

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
      <p className="text-secondary">
        Create and manage different types of proposals
      </p>
      <RestrictedCallout />
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
        <p className="text-sm text-secondary">Add another proposal type</p>
      </div>
    </section>
  );
}
