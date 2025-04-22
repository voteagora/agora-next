"use client";

import { Separator } from "@/components/ui/separator";
import { Fragment, useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProposalType from "./ProposalType";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import toast from "react-hot-toast";
import BlockScanUrls from "../shared/BlockScanUrl";
import { FormattedProposalType } from "@/lib/types";

const RestrictedCallout = () => {
  const { address, isConnected } = useAccount();
  const { contracts, namespace } = Tenant.current();

  const { data: managerAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "manager",
    chainId: contracts.governor?.chain.id,
  }) as { data: `0x${string}` };

  const { data: adminAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
    chainId: contracts.governor?.chain.id,
  }) as { data: `0x${string}` };

  const { data: timelockAddress } = useReadContract({
    address: contracts.governor?.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "timelock",
    chainId: contracts.governor?.chain.id,
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
  proposalTypes: FormattedProposalType[];
}) {
  const allScopes = useMemo(() => {
    return proposalTypes.flatMap((proposalType) => proposalType.scopes ?? []);
  }, [proposalTypes]);

  const fmtPropTypes = useMemo(
    () =>
      proposalTypes.map(
        ({ quorum, approval_threshold, name, proposal_type_id, scopes }) => ({
          name,
          quorum: Number(quorum) / 100,
          approval_threshold: Number(approval_threshold) / 100,
          proposal_type_id: Number(proposal_type_id), // This will be of the format "0", "1", "2", etc.
          isClientSide: false,
          scopes,
        })
      ),
    []
  );

  const [propTypes, setPropTypes] = useState<FormattedProposalType[]>(
    fmtPropTypes ?? []
  );

  const handleDeleteProposalType = useCallback((id: number, hash?: string) => {
    toast.success(
      <div className="flex flex-col items-center gap-2 p-1">
        <span className="text-sm font-semibold">Proposal type deleted</span>
        {hash && <BlockScanUrls hash1={hash} />}
      </div>
    );
    setPropTypes((prevPropTypes) =>
      prevPropTypes.filter(
        (proposalType) => id !== proposalType.proposal_type_id
      )
    );
  }, []);

  const handleSuccessSetProposalType = useCallback(
    (id: number, hash?: string) => {
      toast.success(
        <div className="flex flex-col items-center gap-2 p-1">
          <span className="text-sm font-semibold">Proposal type updated</span>
          {hash && <BlockScanUrls hash1={hash} />}
        </div>
      );
      setPropTypes((prevPropTypes) =>
        prevPropTypes.map((proposalType) => {
          if (proposalType.proposal_type_id === id) {
            return { ...proposalType, isClientSide: false }; // Toggle the isClientSide flag only for the matching id
          }
          return proposalType;
        })
      );
    },
    []
  );

  return (
    <section className="gl_box bg-neutral">
      <h1 className="font-extrabold text-2xl text-primary">
        Proposal type settings
      </h1>
      <p className="text-secondary">
        Create and manage different types of proposals
      </p>
      <RestrictedCallout />
      {propTypes.map((proposalType) => (
        <Fragment key={proposalType.proposal_type_id}>
          <ProposalType
            votableSupply={votableSupply}
            proposalType={proposalType}
            index={proposalType.proposal_type_id}
            onDelete={handleDeleteProposalType}
            onSuccessSetProposalType={handleSuccessSetProposalType}
            availableScopes={allScopes ?? []}
          />
          <Separator className="my-8" />
        </Fragment>
      ))}

      <div
        className="inline-flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setPropTypes((prevPropTypes) => [
            ...prevPropTypes,
            {
              quorum: 50,
              approval_threshold: 50,
              name: "",
              proposal_type_id: prevPropTypes.length,
              isClientSide: true,
              scopes: [],
            },
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
