import { VStack } from "@/components/Layout/Stack";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import { getBlockScanUrl } from "@/lib/utils";

const SponsorOffchainProposalDialog = ({
  redirectUrl,
  txHash,
  closeDialog,
}: {
  redirectUrl: string;
  txHash: `0x${string}`;
  closeDialog: () => void;
}) => {
  const tenant = Tenant.current();
  const router = useRouter();

  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-neutral rounded-xl">
        <VStack>
          <VStack className="w-full">
            <Image
              src={tenant.ui.assets.success}
              className="w-full mb-3"
              alt="Success"
            />
            <div className="mb-2 text-2xl font-black text-primary">
              Proposal complete!
            </div>
            <div className="text-base text-secondary mb-5">
              It may take a few minutes for the proposal to be indexed and
              appear on Agora.
            </div>
            <div>
              <UpdatedButton
                fullWidth={true}
                type="primary"
                onClick={async () => {
                  // TODO: redirect to the proposal page once we have indexing available
                  router.push(redirectUrl);
                  closeDialog();
                }}
              >
                View Proposals
              </UpdatedButton>
            </div>
            <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-secondary">View transaction on EAS</span>
              <div className="flex flex-row items-center space-x-2">
                <Link href={`${getBlockScanUrl(txHash, true)}`}>
                  <Image
                    src={icons.link}
                    height="16"
                    width="16"
                    alt="link icon"
                  />
                </Link>
              </div>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorOffchainProposalDialog;
