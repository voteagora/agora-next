"use client";

import React, { useContext, useEffect, useState } from "react";

import DraftProposalFormSubmitChecklist from "./DraftProposalFormSubmitChecklist";
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { CheckmarkIcon } from "react-hot-toast";
import { DebounceInput } from "react-debounce-input";
import { ProposalChecklist, ProposalDraft } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface DraftProposalReviewProps {
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  getProposalChecklist: (proposal_id: string) => Promise<ProposalChecklist[]>;
}

const staticText = {
  submitRequirement:
    "You do not meet the requirement to submit this proposal. However, you can ask someone who does to help you by sharing this link with them.",
};

const DraftProposalReview: React.FC<DraftProposalReviewProps> = (props) => {
  const {
    proposalState,
    setProposalState,
    updateProposal,
    getProposalChecklist,
  } = props;

  const [sponsorInput, setSponsorInput] = useState<string>("");

  const {
    data: ensResolvedAddress,
    isError: ensResolvedAddressError,
    error: ensResolvedAddressErrorMessage,
    isLoading: ensResolvedAddressLoading,
  } = useEnsAddress({
    chainId: 1,
    name: sponsorInput,
  });

  const {
    data: ensResolvedAvatar,
    isError: ensResolvedAvatarError,
    isLoading: ensResolvedAvatarLoading,
  } = useEnsAvatar({
    chainId: 1,
    name: sponsorInput,
  });

  const [sponsorAddress, setSponsorAddress] = useState<string>("");
  const [canSponsor, setCanSponsor] = useState<boolean>(false);

  const hasVotingPower = (address: string) => {
    // TODO implement voting power check
    // State for today: Andrei is working on the infra
    // right now only nick.eth can sponsor
    return (
      address === "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5" ||
      address === "0x000372c2ad29A4C1D89d6d8be7eb1349b103BABd"
    );
  };

  useEffect(() => {
    if (!!ensResolvedAddress) {
      setSponsorAddress(ensResolvedAddress);
    }
  }, [ensResolvedAddress]);

  useEffect(() => {
    // check if ethereum address
    const isEthereumAddress = /^(0x)?[0-9a-fA-F]{40}$/i.test(sponsorInput);
    if (isEthereumAddress) {
      setSponsorAddress(sponsorInput);
    } else {
      if (!ensResolvedAddress) {
        setSponsorAddress("");
      }
    }
  }, [sponsorInput]);

  useEffect(() => {
    if (!!sponsorAddress) {
      setCanSponsor(hasVotingPower(sponsorAddress));
    }
  }, [sponsorAddress]);

  const handleSubmitProposal = async () => {
    // TODO unify states and names across frontend state and database
    const updatedProposal = await updateProposal(proposalState, {
      proposal_status_id: 4,
      sponsor_address: sponsorAddress,
    });

    setProposalState({
      ...updatedProposal,
      transactions: proposalState.transactions,
    });
  };

  return (
    <div>
      <div className="bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] z-10 mx-6">
        <div className="flex flex-row justify-between px-6 text-[#B16B19] text-xs font-medium py-2">
          <p>Your proposal review</p>
          <p>Please review carefully</p>
        </div>
        <div className="flex flex-col gap-y-6 px-6 pt-6 pb-9 bg-white border border-gray-eb rounded-2xl z-20">
          <h3 className="text-2xl font-black">{proposalState.title}</h3>
          <div className="bg-[#F7F7F7] rounded-lg border border-gray-eo w-[620px] break-all">
            <p className="stone-500 text-xs pt-3 px-6">Proposed transactions</p>
            {proposalState.transactions.map((transaction, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col justify-between px-6 py-4 text-stone-700 text-xs"
                >
                  <p>{`// ${transaction.description}`}</p>
                  <p>{transaction.target}</p>
                  <p>{transaction.function_details}</p>
                  <p>{transaction.value}</p>
                  <p>{transaction.calldata}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-y-1 text-base">
            <label className="font-medium">Description</label>
            <p className="text-gray-4f">{proposalState.description}</p>
          </div>
          <div className="flex flex-col gap-y-1 text-base">
            <label className="font-medium">Abstract</label>
            <MarkdownPreview
              source={proposalState.abstract}
              className="h-full py-3 rounded-t-lg max-w-[650px] bg-transparent"
              // make background transparent
              style={{
                backgroundColor: "transparent",
              }}
              wrapperElement={{
                "data-color-mode": "light",
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 px-6 pt-6 pb-9">
        <div className="flex flex-col gap-y-3 text-base">
          <p className="font-medium">Ready to submit?</p>
          <p className="text-gray-4f max-w-[620px]">
            {staticText.submitRequirement}
          </p>
          <DraftProposalFormSubmitChecklist
            proposalState={proposalState}
            getProposalChecklist={getProposalChecklist}
          />
          <div className="flex flex-row w-full gap-x-16">
            <div className="flex flex-col w-full">
              <label className="font-medium text-sm mb-1">Select sponsor</label>
              {/* DebounceInput has some TypeScript problem but works well: https://github.com/vercel/next.js/issues/42292 */}
              {/* @ts-expect-error Server Component */}
              <DebounceInput
                rows={1}
                className="py-3 px-4 w-full h-[48px] border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent"
                placeholder={"nick.eth"}
                value={sponsorInput}
                onChange={(e) => setSponsorInput(e.target.value)}
                debounceTimeout={300}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="font-medium text-sm mb-1">
                Sponsor verification
              </label>
              <div className="flex flex-row items-center justify-between py-3 px-4 w-full h-[48px] border border-gray-eo placeholder-gray-af bg-gray-fa rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-af focus:border-transparent">
                <div className="flex flex-row items-center gap-x-2">
                  {!!ensResolvedAvatar && (
                    <img
                      src={ensResolvedAvatar}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  {!!ensResolvedAddress && <p>{sponsorInput}</p>}
                </div>
                {!!sponsorAddress && canSponsor && (
                  <div className="flex flex-row items-center gap-x-1.5">
                    <CheckmarkIcon className="w-5 h-5" />
                    <p className="text-green-600">Can sponsor</p>
                  </div>
                )}
                {!!sponsorAddress && !canSponsor && (
                  <div className="flex flex-row items-center gap-x-1.5">
                    <p className="text-red-600">Cannot sponsor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className="w-full flex flex-row justify-center shadow-sm py-3 bg-black text-white rounded-lg mt-4"
            onClick={() => handleSubmitProposal()}
          >
            Submit proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftProposalReview;
