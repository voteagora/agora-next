import { VStack } from "@/components/Layout/Stack";
import { useNavigate } from "@tanstack/react-router";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
import { getBlockScanUrl } from "@/lib/utils";

const SponsorOffchainProposalDialog = ({
  redirectUrl,
  attestationUid,
  closeDialog,
}: {
  redirectUrl: string;
  attestationUid: `0x${string}`;
  closeDialog: () => void;
}) => {
  const tenant = Tenant.current();
  const navigate = useNavigate();

  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-neutral rounded-xl">
        <VStack>
          <VStack className="w-full">
            <img
              src={tenant.ui.assets.success as string}
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
                  navigate({ to: redirectUrl as never });
                  closeDialog();
                }}
              >
                View Proposals
              </UpdatedButton>
            </div>
            <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-secondary">View attestation on EAS</span>
              <div className="flex flex-row items-center space-x-2">
                <a
                  href={`${getBlockScanUrl(attestationUid, true)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img
                    src={icons.link as string}
                    height={16}
                    width={16}
                    alt="link icon"
                  />
                </a>
              </div>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorOffchainProposalDialog;
