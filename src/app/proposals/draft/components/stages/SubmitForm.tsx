import Image from "next/image";
import FormCard from "../form/FormCard";
import DraftPreview from "../DraftPreview";
import { ProposalDraft } from "@prisma/client";
import { icons } from "@/assets/icons/icons";
import { UpdatedButton } from "@/components/Button";

const FAKE_PROPOSAL_DRAFT = {
  title: "Proposal title",
  description:
    "This proposal introduces new actions and strategies to the Endowment with the a",
  abstract:
    "Following the successful approval of E.P. 4.2, the second tranche of the Endowment was funded with 16,000 ETH. Community feedback during the E.P. 4.2 voting window indicated a desire to reduce exposure to Lido due to concerns about centralization risks in the network. While diversifying ETH-neutral holdings was already underway, the need for further diversification and divestment from Lido became clear during community discussions and the last Meta-gov call before the vote's closure. Consequently, karpatkey and @steakhouse proposed a 20% cap on Lido's maximum allocation within",
  temp_check_link: "https://discuss.ens.domains/",
} as ProposalDraft;

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

const SubmitForm = ({ draftProposal }: { draftProposal: ProposalDraft }) => {
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
            <DraftPreview proposalDraft={FAKE_PROPOSAL_DRAFT} />
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
