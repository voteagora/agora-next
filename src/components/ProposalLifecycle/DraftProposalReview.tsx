"use client";

import React, { useContext, useEffect, useState } from "react";

import DraftProposalFormSubmitChecklist from "./DraftProposalFormSubmitChecklist";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { CheckmarkIcon } from "react-hot-toast";
import { DebounceInput } from "react-debounce-input";

interface DraftProposalReviewProps {}

const staticText = {
  submitRequirement:
    "You do not meet the requirement to submit this proposal. However, you can ask someone who does to help you by sharing this link with them.",
};

const variables = {
  proposalTitle: "[EP 4.6] [Executable] Endowment permission update",
  proposalDescription:
    "This proposal introduces new actions and strategies to the Endowment with the a",
  proposalAbstract:
    "Following the successful approval of E.P. 4.2, the second tranche of the Endowment was funded with 16,000 ETH. Community feedback during the E.P. 4.2 voting window indicated a desire to reduce exposure to Lido due to concerns about centralization risks in the network. While diversifying ETH-neutral holdings was already underway, the need for further diversification and divestment from Lido became clear during community discussions and the last Meta-gov call before the vote's closure. Consequently, karpatkey and @steakhouse proposed a 20% cap on Lido's maximum allocation within",
};

const DraftProposalReview: React.FC<DraftProposalReviewProps> = (props) => {
  const { proposalState } = useContext(ProposalLifecycleDraftContext);

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

  const handleSubmitProposal = () => {
    alert(
      "Proposal submitted. Title: " +
        proposalState.title +
        " Description: " +
        proposalState.description +
        " Abstract: " +
        proposalState.abstract +
        " Proposal Type: " +
        proposalState.proposalType +
        " Transactions: " +
        JSON.stringify(proposalState.transactions) +
        " Audit URL: " +
        proposalState.auditURL +
        " Update ENS Docs Status: " +
        proposalState.updateENSDocsStatus +
        " Post on Discourse Status: " +
        proposalState.postOnDiscourseStatus +
        " Temp Check Link: " +
        proposalState.tempCheckLink
    );
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
          <div className="bg-[#F7F7F7] h-[160px] rounded-lg border border-gray-eo"></div>
          <div className="flex flex-col gap-y-1 text-base">
            <label className="font-medium">Description</label>
            <p className="text-gray-4f">{proposalState.description}</p>
          </div>
          <div className="flex flex-col gap-y-1 text-base">
            <label className="font-medium">Abstract</label>
            {/* TODO in markdown */}
            <p className="text-gray-4f max-w-[620px]">
              {proposalState.abstract}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 px-6 pt-6 pb-9">
        <div className="flex flex-col gap-y-3 text-base">
          <p className="font-medium">Ready to submit?</p>
          <p className="text-gray-4f max-w-[620px]">
            {staticText.submitRequirement}
          </p>
          <DraftProposalFormSubmitChecklist />
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
                {!!ensResolvedAddress && true && (
                  <div className="flex flex-row items-center gap-x-1.5">
                    <CheckmarkIcon className="w-5 h-5" />
                    <p className="text-green-600">Can sponsor</p>
                  </div>
                )}
                {!!ensResolvedAddress && false && (
                  <div className="flex flex-row items-center gap-x-1.5">
                    <p className="text-red-600">Cannot sponsor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className="w-full flex flex-row justify-center shadow-sm py-3 bg-black text-white rounded-lg mt-4"
            onClick={handleSubmitProposal}
          >
            Submit proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftProposalReview;
