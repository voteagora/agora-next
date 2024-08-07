import { Button } from "../../../components/ui/button";

const ClaimFlowGithubCheckDialog = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  return (
    <div>
      <span className="block h-[150px] w-full bg-agora-stone-100 rounded-lg"></span>
      <h3 className="font-black text-2xl mt-6">Claim Github</h3>
      <p className="font-medium text-secondary mt-2">
        Scroll values our ecosystem developers and contributors. If you have
        built projects on Scroll, won hackathons, or otherwise helped the Scroll
        community in some manner, you might be eligible for a token allocation
        as a recognition of your past contributions.
      </p>
      <input
        type="text"
        placeholder="Email"
        className="border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full mt-6"
      />
      <div className="mt-6 flex items-center justify-end space-x-2">
        <Button
          className="w-full"
          variant="brandPrimary"
          onClick={async () => {
            closeDialog();
          }}
        >
          Check eligibility
        </Button>
      </div>
    </div>
  );
};

export default ClaimFlowGithubCheckDialog;
