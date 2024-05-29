"use client";
import { UpdatedButton } from "@/components/Button";

const UpdateDraftProposalDialog = ({
  redirectUrl,
}: {
  redirectUrl: string;
}) => {
  return (
    <div>
      <span className="block h-[150px] w-full bg-agora-stone-100 rounded-lg"></span>
      <h3 className="font-black text-2xl mt-6">Draft successfully updated</h3>
      <p className="text-agora-stone-700">
        If you&apos;ve posted your draft on the forums or in the ENS doc site,
        please remember to post an update there as well.
      </p>
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

export default UpdateDraftProposalDialog;
