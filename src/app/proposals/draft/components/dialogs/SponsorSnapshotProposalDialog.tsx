import { VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import { useNavigate } from "@tanstack/react-router";
import Tenant from "@/lib/tenant/tenant";

const SponsorSnapshotProposalDialog = ({
  redirectUrl,
  snapshotLink,
  closeDialog,
}: {
  redirectUrl: string;
  snapshotLink: string;
  closeDialog: () => void;
}) => {
  const tenant = Tenant.current();
  const navigate = useNavigate();
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack>
          <VStack className="w-full">
            <img
              src={tenant.ui.assets.success as string}
              className="w-full mb-3"
              alt="Cheerful scene with ENS + agora logo and thumbs up emojis."
            />
            <div className="text-2xl font-black">Proposal complete!</div>
            <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-agora-stone-700">Snapshot proposal</span>
              <div className="flex flex-row items-center space-x-2">
                <span className="text-green-500">Created</span>

                <a
                  href={snapshotLink}
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

            <div
              className="mt-4 flex flex-row justify-center w-full py-3 rounded-lg bg-gray-eo cursor-pointer"
              onClick={() => {
                navigate({ to: redirectUrl as never });
                closeDialog();
              }}
            >
              <div className="text-base font-semibold text-gray-4f">
                Continue
              </div>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SponsorSnapshotProposalDialog;
