import { VStack } from "@/components/Layout/Stack";
import { useRouter } from "next/navigation";
import { useWaitForTransactionReceipt } from "wagmi";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

const SponsorOnchainProposalDialog = ({
  redirectUrl,
  txHash,
  closeDialog,
}: {
  redirectUrl: string;
  txHash: `0x${string}`;
  closeDialog: () => void;
}) => {
  const tenant = Tenant.current();
  const { isLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const router = useRouter();
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack>
          <VStack className="w-full">
            <Image
              src={
                isLoading ? tenant.ui.assets.pending : tenant.ui.assets.success
              }
              className="w-full mb-3"
              alt={isLoading ? "Pending" : "Success"}
            />
            <div className="mb-2 text-2xl font-black">
              {isLoading ? "Creating your proposal ..." : "Proposal complete!"}
            </div>
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
            {!isLoading && <BlockScanUrls hash1={txHash} />}
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorOnchainProposalDialog;
