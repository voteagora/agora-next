"use client";

import { useState } from "react";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { createSnapshot } from "../../draft/utils/createSnapshot";
import { PLMConfig, SocialProposal } from "../../../proposals/draft/types";
import { useAccount, useSignMessage } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";

const SocialProposalAction = ({
  draftProposal,
}: {
  draftProposal: SocialProposal;
}) => {
  const { ui, isProd } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");

  const [isSnapshotPending, setIsSnapshotPending] = useState<boolean>(false);
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const messageSigner = useSignMessage();

  return (
    <UpdatedButton
      isLoading={isSnapshotPending}
      fullWidth={true}
      type="primary"
      onClick={async () => {
        try {
          setIsSnapshotPending(true);
          const proposalId = await createSnapshot({
            address: address as `0x${string}`,
            proposal: draftProposal,
          });

          // TODO: make snapshot pull from config
          const snapshotLink = isProd
            ? `https://snapshot.org/#/${(plmToggle?.config as PLMConfig)?.snapshotConfig?.domain}/proposal/${proposalId}`
            : `https://testnet.snapshot.org/#/michaelagora.eth/proposal/${proposalId}`;

          const messagePayload = {
            action: "sponsorDraft",
            draftProposalId: draftProposal.id,
            creatorAddress: address,
            timestamp: new Date().toISOString(),
          };
          const message = JSON.stringify(messagePayload);
          const signature = await messageSigner
            .signMessageAsync({ message })
            .catch(() => undefined);
          if (!signature) {
            setIsSnapshotPending(false);
            return;
          }
          await sponsorDraftProposal({
            draftProposalId: draftProposal.id,
            snapshot_link: snapshotLink,
            creatorAddress: address as `0x${string}`,
            message,
            signature,
          });

          setIsSnapshotPending(false);
          openDialog({
            type: "SPONSOR_SNAPSHOT_DRAFT_PROPOSAL",
            params: { redirectUrl: "/", snapshotLink },
          });
        } catch (error) {
          console.log(error);
        }
      }}
    >
      Submit proposal
    </UpdatedButton>
  );
};

export default SocialProposalAction;
