import { icons } from "@/icons/icons";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";

import { useContext, useEffect, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import DraftProposalSocialVotingStrategyType from "./DraftProposalSocialVotingStrategyType";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PlusIcon } from "lucide-react";

interface DraftProposalSocialVotingStrategyProps {
  label: string;
  description: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  options: { index: number; value: string }[];
  setOptions: React.Dispatch<
    React.SetStateAction<{ index: number; value: string }[]>
  >;
}

const DraftProposalSocialVotingStrategy: React.FC<
  DraftProposalSocialVotingStrategyProps
> = (props) => {
  const {
    label,
    description,
    proposalState,
    setProposalState,
    updateProposal,
    options,
    setOptions,
  } = props;

  const handleAddOption = () => {
    setOptions([...options, { index: options.length + 1, value: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    // removes the option and decreases the index of all the options after it
    const newOptions = options
      .filter((option) => option.index !== index)
      .map((option) => {
        if (option.index > index) {
          return { index: option.index - 1, value: option.value };
        } else {
          return option;
        }
      });

    setOptions(newOptions);
  };

  useEffect(() => {
    if (proposalState.voting_strategy_social === "basic") {
      setOptions([
        {
          index: 1,
          value: "For",
        },
        {
          index: 2,
          value: "Against",
        },
        {
          index: 3,
          value: "Abstain",
        },
      ]);
    } else {
      setOptions([
        {
          index: 1,
          value: "",
        },
        {
          index: 2,
          value: "",
        },
      ]);
    }
  }, [proposalState.voting_strategy_social]);

  return (
    <div className="flex flex-col px-6 py-4 border-y border-gray-eb">
      <label className="font-medium mb-2">{label}</label>
      <p className="text-xs max-w-[620px] text-gray-4f mb-6">{description}</p>
      <DraftProposalSocialVotingStrategyType
        label="Voting strategy"
        explanation="Each voter may select any number of choices"
        proposalState={proposalState}
        setProposalState={setProposalState}
        updateProposal={updateProposal}
      />
      <div className="flex flex-row w-full gap-x-4">
        <DraftProposalSocialVotingStrategyDateInput
          field="start_date_social"
          label="Start date"
          placeholder="Start date"
          proposalState={proposalState}
          setProposalState={setProposalState}
          updateProposal={updateProposal}
        />
        <DraftProposalSocialVotingStrategyDateInput
          field="end_date_social"
          label="End date"
          placeholder="End date"
          proposalState={proposalState}
          setProposalState={setProposalState}
          updateProposal={updateProposal}
        />
      </div>
      {options.map((option) => (
        <DraftProposalSocialVotingStrategyOptionInput
          key={`${option.index} ${proposalState.voting_strategy_social}`}
          optionIndex={option.index}
          votingStrategy={proposalState.voting_strategy_social}
          label={`Option ${option.index + 1}`}
          value={option.value}
          placeholder="Option value (max 32 characters)"
          proposalState={proposalState}
          removeOption={handleRemoveOption}
        />
      ))}
      {proposalState.voting_strategy_social === "approval" && (
        <button
          className="py-3 px-4 w-full flex flex-row justify-between border border-gray-eo rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
          onClick={() => handleAddOption()}
        >
          Add another option
          <PlusIcon size={20} className="" />
        </button>
      )}
    </div>
  );
};

export default DraftProposalSocialVotingStrategy;

interface DraftProposalSocialVotingStrategyOptionInputProps {
  optionIndex: number;
  value: string;
  votingStrategy: string | null;
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
  removeOption: (index: number) => void;
  // updateProposal: (
  //   proposal: ProposalDraft,
  //   updateData: Partial<ProposalDraft>
  // ) => Promise<ProposalDraft>;
}

const DraftProposalSocialVotingStrategyOptionInput: React.FC<
  DraftProposalSocialVotingStrategyOptionInputProps
> = (props) => {
  const {
    optionIndex,
    value,
    votingStrategy,
    label,
    placeholder,
    proposalState,
    removeOption,
  } = props;

  const [optionValue, setOptionValue] = useState(value);

  useEffect(() => {
    setOptionValue(value);
  }, [value]);

  return (
    <div className="flex flex-col mb-5">
      <div className="flex flex-row justify-between">
        <label className="font-medium text-sm mb-1">{label}</label>

        {optionIndex >= 2 && votingStrategy == "approval" && (
          <button
            className="flex items-center gap-x-2 text-gray-af"
            onClick={() => removeOption(optionIndex)}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* @ts-expect-error Server Component */}
      <DebounceInput
        debounceTimeout={1000}
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        placeholder={placeholder}
        disabled={votingStrategy === "basic"}
        value={optionValue}
        onChange={(e) => setOptionValue(e.target.value)}
      />
    </div>
  );
};

interface DraftProposalSocialVotingStrategyDateInputProps {
  field: "start_date_social" | "end_date_social";
  label: string;
  placeholder: string;
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalSocialVotingStrategyDateInput: React.FC<
  DraftProposalSocialVotingStrategyDateInputProps
> = (props) => {
  const {
    field,
    label,
    placeholder,
    proposalState,
    setProposalState,
    updateProposal,
  } = props;

  async function handleUpdateDate(date: Date | null) {
    const updatedProposal = await updateProposal(proposalState, {
      [field]: date,
    });
    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
      ProposalDraftOption: proposalState.ProposalDraftOption,
    });
  }

  return (
    <div className="flex flex-col mb-5 w-full">
      <label className="font-medium text-sm mb-1">{label}</label>
      {/* @ts-ignore */}
      <DatePicker
        selected={
          proposalState[field] ? (proposalState[field] as Date) : new Date()
        }
        onChange={(date) => handleUpdateDate(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        dateFormat="MMMM d, yyyy h:mm aa"
        className="py-3 px-4 w-full border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
        minDate={new Date()}
      />
    </div>
  );
};
