import Image from "next/image";
import FormCard from "../form/FormCard";
import DraftPreview from "../DraftPreview";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { icons } from "@/assets/icons/icons";
import { UpdatedButton } from "@/components/Button";
import { useContractRead, useAccount, useBlockNumber } from "wagmi";
import ENSGovernorABI from "@/lib/contracts/abis/ENSGovernor.json";
import Tenant from "@/lib/tenant/tenant";

const SUBMISSION_CHECKLIST_ITEMS = [
  {
    title: "Discourse temp check",
    date: "11/24/24",
    completedBy: "frog.eth",
    link: "https://discuss.ens.domains/",
  },
  {
    title: "Draft created and shared on forums",
    date: "11/24/24",
    completedBy: "frog.eth",
    link: "https://discuss.ens.domains/",
  },
  {
    title: "Transaction simulation",
    date: "11/24/24",
    completedBy: "frog.eth",
    link: "https://discuss.ens.domains/",
  },
  {
    title: "ENS Docs updated",
    date: "11/24/24",
    completedBy: "frog.eth",
    link: "https://discuss.ens.domains/",
  },
  {
    title: "100k ENS proposal threshold",
    date: "11/24/24",
    completedBy: "frog.eth",
    link: "https://discuss.ens.domains/",
  },
];

const SubmitForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & { transactions: ProposalDraftTransaction[] };
}) => {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useContractRead({
    abi: ENSGovernorABI,
    address: Tenant.current().contracts.governor.address as `0x${string}`,
    functionName: "getVotes",
    chainId: Tenant.current().contracts.governor.chain.id,
    args: [address, blockNumber],
  });

  console.log(accountVotesData);
  return (
    <form>
      <FormCard>
        <FormCard.Section>
          <p className="text-agora-stone-700">
            Please proofread a preview of your proposal below. If you need to
            change any of its content, please edit your draft in the previous
            step.
          </p>
          <div className="mt-6 mb-[-60px] z-20 relative">
            <DraftPreview proposalDraft={draftProposal} />
          </div>
        </FormCard.Section>
        <FormCard.Section className="!z-0 pt-[54px]">
          <h3 className="font-semibold">Ready to submit?</h3>
          <p className="text-agora-stone-700 mt-2">
            You do not meet the requirement to submit this proposal. However,
            you can ask someone who does to help you by sharing this link with
            them.
          </p>
          <div className="mt-6">
            {SUBMISSION_CHECKLIST_ITEMS.map((item, index) => {
              return (
                <div
                  className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4"
                  key={`checklist-${index}`}
                >
                  <p className="flex-grow">{item.title}</p>
                  <span className="text-stone-500 font-mono text-xs">
                    on {item.date}
                  </span>
                  <span className="text-stone-500 font-mono text-xs">
                    (by {item.completedBy})
                  </span>
                  <input
                    type="checkbox"
                    className="rounded text-agora-stone-900"
                    checked
                  />
                  <Image
                    src={icons.link}
                    height="16"
                    width="16"
                    alt="link icon"
                  />
                </div>
              );
            })}
          </div>
          <UpdatedButton fullWidth={true} className="mt-6">
            Submit proposal
          </UpdatedButton>
        </FormCard.Section>
      </FormCard>
    </form>
  );
};

export default SubmitForm;
