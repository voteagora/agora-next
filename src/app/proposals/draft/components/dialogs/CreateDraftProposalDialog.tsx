import { UpdatedButton } from "@/components/Button";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";

const CreateDraftProposalDialog = ({
  redirectUrl,
  githubUrl,
}: {
  redirectUrl: string;
  githubUrl: string;
}) => {
  return (
    <div>
      <span className="block h-[150px] w-full bg-agora-stone-100 rounded-lg"></span>
      <h3 className="font-black text-2xl mt-6">Draft successfully created</h3>
      <div className="flex flex-row justify-between items-center mt-6">
        <span className="text-agora-stone-700">Update ENS docs</span>
        <div className="flex flexr-row items-center space-x-2">
          <span className="text-green-500">Completed</span>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            <Image src={icons.link} height="16" width="16" alt="link icon" />
          </a>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-2">
        <UpdatedButton
          fullWidth={true}
          type="primary"
          onClick={async () => {
            window.location.href = redirectUrl;
          }}
        >
          Continue
        </UpdatedButton>
      </div>
    </div>
  );
};

export default CreateDraftProposalDialog;
