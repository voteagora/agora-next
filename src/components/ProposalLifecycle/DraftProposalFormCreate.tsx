"use client";

import React, { useContext, useState } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";

import DraftProposalAbstract from "./DraftProposalAbstract";
import DraftProposalTypeChoice from "./DraftProposalTypeChoice";
import DraftProposalTransaction from "./DraftProposalTransaction";
import DraftProposalCreateButton from "./DraftProposalCreateButton";
import DraftProposalTitleInput from "./DraftProposalTitleInput";
import DraftProposalDescriptionInput from "./DraftProposalDescriptionInput";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";
import DraftProposalSocialVotingStrategy from "./DraftProposalSocialVotingStrategy";

const staticText = {
  heading: "Create proposal draft",
  description:
    "Use this draft to create and share the proposal you’d like to submit",
  proposalTypeExplanation:
    "Passed on-chain, Executable Proposals execute code related to ENS and ENS DAO contracts, as voted on by the DAO.",
  executableProposalTitlePlaceholder:
    "[EPx.x][Executable] My proposal title...",
  socialProposalTitlePlaceholder: "[SPx.x][Social] My proposal title...",
  proposalDescriptionPlaceholder:
    "A short (1-2 sentence) description of the proposal...",
  proposalAbstractPlaceholder:
    "Here’s what my proposal aims to achieve (p.s. I like markdown formatting)...",
  proposedTransactionDescription:
    "Proposed transactions will execute after a proposal passes and then gets executed. If you skip this step, a transfer of 0 ETH to you (the proposer) will be added.",
  createButtonExplanation:
    "This will post your draft to both the ENS forums and request an update to the ENS DAO docs.",
  checkmarkInfo:
    "Both of these are required. Please uncheck only if you’ve already completed these manually.",
};

interface DraftProposalFormCreateProps {
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  getProposal: (
    proposal_id: string
  ) => Promise<ProposalDraftWithTransactions | null>;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  addTransaction: (
    proposalId: number,
    transactionType: "transfer" | "custom"
  ) => Promise<ProposalDraftTransaction>;
  updateTransaction: (
    transactionId: number,
    data: Partial<ProposalDraftTransaction>
  ) => Promise<ProposalDraftTransaction>;
  deleteTransaction: (
    transactionId: number
  ) => Promise<ProposalDraftTransaction[]>;
  createGithubProposal: (
    proposal: ProposalDraftWithTransactions
  ) => Promise<string>;
  saveSocialProposalOptions: (
    proposal: ProposalDraft,
    options: string[]
  ) => Promise<void>;
  registerChecklistEvent: (
    proposal_id: string,
    stage: string,
    completed_by: string
  ) => void;
}

const DraftProposalFormCreate: React.FC<DraftProposalFormCreateProps> = (
  props
) => {
  const {
    proposalState,
    setProposalState,
    updateProposal,
    createGithubProposal,
    saveSocialProposalOptions,
    registerChecklistEvent,
  } = props;

  type Option = {
    index: number;
    value: string;
  };

  const [socialVotingStrategyOptions, setSocialVotingStrategyOptions] =
    useState<Option[]>([]);

  return (
    <div className="">
      <AccordionItem
        value="draft-create"
        className="w-full rounded-2xl border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">{staticText.heading}</h2>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-4f px-6 pb-7 max-w-[620px]">
            {staticText.description}
          </p>
          <DraftProposalTypeChoice
            label="Proposal type"
            explanation={staticText.proposalTypeExplanation}
            proposalState={proposalState}
            setProposalState={setProposalState}
            updateProposal={updateProposal}
          />
          <DraftProposalTitleInput
            label="Title"
            placeholder={
              proposalState.proposal_type === "executable"
                ? staticText.executableProposalTitlePlaceholder
                : staticText.socialProposalTitlePlaceholder
            }
            proposalState={proposalState}
            updateProposal={updateProposal}
          />
          <DraftProposalDescriptionInput
            label="Description"
            placeholder={staticText.proposalDescriptionPlaceholder}
            proposalState={proposalState}
            updateProposal={updateProposal}
          />
          <DraftProposalAbstract
            label="Abstract"
            placeholder={staticText.proposalAbstractPlaceholder}
            proposalState={proposalState}
            setProposalState={setProposalState}
            updateProposal={updateProposal}
          />
          {proposalState.proposal_type === "executable" ? (
            <DraftProposalTransaction
              label="Proposed transaction"
              description={staticText.proposedTransactionDescription}
              proposalState={proposalState}
              setProposalState={setProposalState}
              addTransaction={props.addTransaction}
              updateTransaction={props.updateTransaction}
              deleteTransaction={props.deleteTransaction}
              registerChecklistEvent={registerChecklistEvent}
            />
          ) : (
            <DraftProposalSocialVotingStrategy
              label="Voting strategy and choices"
              description="Choose the voting strategy and options for your proposal"
              proposalState={proposalState}
              setProposalState={setProposalState}
              updateProposal={updateProposal}
              options={socialVotingStrategyOptions}
              setOptions={setSocialVotingStrategyOptions}
            />
          )}
          <DraftProposalCreateButton
            description={staticText.createButtonExplanation}
            checkmarkInfo={staticText.checkmarkInfo}
            proposalState={proposalState}
            setProposalState={setProposalState}
            updateProposal={updateProposal}
            createGithubProposal={createGithubProposal}
            saveSocialProposalOptions={saveSocialProposalOptions}
            options={socialVotingStrategyOptions}
            registerChecklistEvent={registerChecklistEvent}
          />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default DraftProposalFormCreate;
