import { useState, useEffect } from "react";
import { VStack } from "@/components/Layout/Stack";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import { getBlockScanUrl, wrappedWaitForTransactionReceipt } from "@/lib/utils";
import { DraftProposal, PLMConfig } from "../../types";
import OffchainProposalAction from "@/app/proposals/sponsor/components/OffchainProposalAction";

const SponsorOnchainProposalDialog = ({
  redirectUrl,
  txHash,
  closeDialog,
  isHybrid,
  draftProposal,
}: {
  redirectUrl: string;
  txHash: `0x${string}`;
  closeDialog: () => void;
  isHybrid: boolean;
  draftProposal: DraftProposal;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const config = plmToggle?.config as PLMConfig;
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const waitForTransaction = async () => {
      if (!address) return;

      try {
        await wrappedWaitForTransactionReceipt({
          hash: txHash,
          address: address as `0x${string}`,
        });
      } catch (error) {
        console.error("Error waiting for transaction:", error);
      } finally {
        setIsLoading(false);
      }
    };

    waitForTransaction();
  }, [txHash, address]);

  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-neutral rounded-xl">
        <VStack>
          <VStack className="w-full">
            <Image
              src={
                isLoading ? tenant.ui.assets.pending : tenant.ui.assets.success
              }
              className="w-full mb-3"
              alt={isLoading ? "Pending" : "Success"}
            />
            <div className="mb-2 text-2xl font-black text-primary">
              {isLoading ? "Creating your proposal ..." : "Proposal complete!"}
            </div>
            {!!isHybrid &&
              !!config.offchainProposalCreator &&
              !!address &&
              !config.offchainProposalCreator.includes(address) && (
                <div className="mb-5 text-base text-secondary">
                  Switch to the offchain proposal creator wallet to create an
                  offchain proposal:
                  <div className="text-primary">
                    {config.offchainProposalCreator.join(", ")}
                  </div>
                </div>
              )}
            {isLoading && (
              <div className="mb-5 text-base text-secondary">
                It might take up to a minute for the changes to be reflected.
              </div>
            )}
            {!isLoading && (
              <div className="text-base text-secondary mb-5">
                It may take a few minutes for the proposal to be indexed and
                appear on Agora.
              </div>
            )}
            {!isHybrid && (
              <div>
                <UpdatedButton
                  fullWidth={true}
                  type="primary"
                  isLoading={isLoading}
                  onClick={async () => {
                    // TODO: redirect to the proposal page once we have indexing available
                    router.push(redirectUrl);
                    closeDialog();
                  }}
                >
                  {isLoading
                    ? "Saving your proposal onchain..."
                    : "View Proposals"}
                </UpdatedButton>
              </div>
            )}
            {!isLoading && (
              <div className="flex flex-row justify-between items-center mt-4">
                <span className="text-secondary">
                  View transaction on block explorer
                </span>
                <div className="flex flex-row items-center space-x-2">
                  <Link href={`${getBlockScanUrl(txHash)}`}>
                    <Image
                      src={icons.link}
                      height="16"
                      width="16"
                      alt="link icon"
                    />
                  </Link>
                </div>
              </div>
            )}
            {!!isHybrid &&
              !!config.offchainProposalCreator &&
              !!address &&
              config.offchainProposalCreator.includes(address) && (
                <div className="mt-4">
                  <OffchainProposalAction draftProposal={draftProposal} />
                </div>
              )}
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorOnchainProposalDialog;
