"use client";

import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import Tenant from "@/lib/tenant/tenant";
import { createSnapshot } from "../../draft/utils/createSnapshot";
import { ProposalType } from "../../../proposals/draft/types";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import { useAccount } from "wagmi";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const { inputData } = getInputData(draftProposal);
  const { config } = usePrepareContractWrite({
    address: "0xb65c031ac61128ae791d42ae43780f012e2f7f89",
    abi: ENSGovernorABI,
    functionName: "propose",
    args: inputData,
    chainId: 11155111,
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="mt-6">
      <UpdatedButton
        isLoading={isLoading}
        fullWidth={true}
        type="primary"
        onClick={async () => {
          try {
            if (draftProposal.proposal_type === ProposalType.SOCIAL) {
              const proposalId = await createSnapshot({
                address: address as `0x${string}`,
                proposal: draftProposal,
              });

              const snapshotLink = Tenant.current().isProd
                ? `https://snapshot.org/#/ens.eth/proposal/${proposalId}`
                : `https://testnet.snapshot.org/#/michaelagora.eth/proposal/${proposalId}`;

              await sponsorDraftProposal({
                draftProposalId: draftProposal.id,
                snapshot_link: snapshotLink,
              });

              openDialog({
                type: "SPONSOR_SNAPSHOT_DRAFT_PROPOSAL",
                params: { redirectUrl: "/", snapshotLink },
              });
            } else {
              await writeAsync?.();

              await sponsorDraftProposal({
                draftProposalId: draftProposal.id,
                onchain_transaction_hash: data?.hash,
              });

              openDialog({
                type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
                params: {
                  redirectUrl: "/",
                  txHash: data?.hash as `0x${string}`,
                },
              });
            }
          } catch (error) {
            console.error(error);
            // toast?
          }
        }}
      >
        Submit proposal
      </UpdatedButton>
    </div>
  );
};

export default SponsorActions;
