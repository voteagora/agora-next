import { VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SponsorSnapshotProposalDialog = ({
  redirectUrl,
  snapshotLink,
  closeDialog,
}: {
  redirectUrl: string;
  snapshotLink: string;
  closeDialog: () => void;
}) => {
  const router = useRouter();
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack>
          <VStack className="w-full">
            <img
              src={`/images/ens_success.svg`}
              className="w-full mb-3"
              alt="Cheerful scene with ENS + agora logo and thumbs up emojis."
            />
            <div className="text-2xl font-black">Proposal complete!</div>
            <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-agora-stone-700">Snapshot proposal</span>
              <div className="flex flex-row items-center space-x-2">
                <span className="text-green-500">Created</span>

                <Link href={snapshotLink}>
                  <Image
                    src={icons.link}
                    height="16"
                    width="16"
                    alt="link icon"
                  />
                </Link>
              </div>
            </div>

            <div
              className="mt-4 flex flex-row justify-center w-full py-3 rounded-lg bg-gray-eo cursor-pointer"
              onClick={() => {
                router.push(redirectUrl);
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
