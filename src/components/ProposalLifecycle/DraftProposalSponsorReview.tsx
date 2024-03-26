"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";

import DraftProposalFormSubmitChecklist from "./DraftProposalFormSubmitChecklist";
import { ProposalChecklist, ProposalDraft } from "@prisma/client";
import { ProposalDraftWithTransactions } from "./types";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useSignTypedData,
  useWaitForTransaction,
} from "wagmi";
import ENSGovernorABI from "@/lib/contracts/abis/ENSGovernor.json";
import {
  SnapshotProposalMessage,
  createProposal,
  domain,
  proposalTypes,
} from "./snapshot";

interface DraftProposalReviewProps {
  proposal: ProposalDraftWithTransactions;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
  getProposalChecklist: (proposal_id: string) => Promise<ProposalChecklist[]>;
}

const DraftProposalReview: React.FC<DraftProposalReviewProps> = ({
  proposal,
  updateProposal,
  getProposalChecklist,
}) => {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  type BasicInputData = [string[], number[], string[], string];

  function getInputData(proposal: ProposalDraft): {
    inputData: BasicInputData;
  } {
    const description =
      "# " +
      proposal.title +
      "\n\n" +
      proposal.description +
      "\n" +
      // `${
      //   form.state.draftLink &&
      //   "[Draft Discourse link](" + form.state.draftLink + ")\n"
      // }` +
      `${
        proposal.temp_check_link &&
        "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
      }` +
      "\n\n ## Abstract \n" +
      proposal.abstract;
    // "\n\n ## Specification \n" +
    // form.state.specification;

    // provide default values for basic proposal
    let targets: string[] = [];
    let values: number[] = [];
    let calldatas: string[] = [];
    let inputData: BasicInputData = [targets, values, calldatas, description];

    // TODO add transactions

    targets.push("0x0000000000000000000000000000000000000000");
    values.push(0);
    calldatas.push("0x");

    // try {
    //   if (form.state.transactions.length === 0) {
    //     targets.push(ethers.constants.AddressZero);
    //     values.push(BigNumber.from(0));
    //     calldatas.push("0x");
    //   } else {
    //     form.state.transactions.forEach((t) => {
    //       if (t.type === "Transfer") {
    //         if (t.token.address === ethers.constants.AddressZero) {
    //           targets.push(t.transferTo);
    //           values.push(
    //             ethers.utils.parseUnits(
    //               t.transferAmount.toString() || "0",
    //               t.token.decimals
    //             )
    //           );
    //           calldatas.push("0x");
    //         } else {
    //           targets.push(t.token.address);
    //           values.push(BigNumber.from(0));
    //           calldatas.push(
    //             encodeTransfer(t.transferTo, t.transferAmount, t.token.decimals)
    //           );
    //         }
    //       } else {
    //         targets.push(ethers.utils.getAddress(t.target));
    //         values.push(ethers.utils.parseEther(t.value.toString() || "0"));
    //         calldatas.push(t.calldata);
    //       }
    //     });
    //   }
    // } catch (e) {
    //   Sentry.captureException(e);
    //   console.error(e);
    // }

    return { inputData };
  }

  const { inputData } = getInputData(proposal);

  /**
   * @dev Snapshot
   *
   * @notice snapshot test env is on goerli,
   *         our on sepolia so we need to use a fixed block number
   */
  async function createSnapshot() {
    if (!address) {
      throw new Error("address not available");
    }

    const description =
      "# " +
      proposal.title +
      "\n\n" +
      proposal.description +
      "\n" +
      // `${
      //   form.state.draftLink &&
      //   "[Draft Discourse link](" + form.state.draftLink + ")\n"
      // }` +
      `${
        proposal.temp_check_link &&
        "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
      }` +
      "\n\n ## Abstract \n" +
      proposal.abstract;

    const blockNumber =
      process.env.REACT_APP_DEPLOY_ENV === "prod"
        ? await provider.getBlockNumber()
        : 9244736;
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const message: SnapshotProposalMessage & { [key: string]: unknown } = {
      from: address!,
      space:
        process.env.REACT_APP_DEPLOY_ENV === "prod"
          ? "ens.eth"
          : "stepandel.eth",
      timestamp,
      type: proposal.proposal_type === "basic" ? "single-choice" : "approval",
      title: proposal.title,
      body: description,
      discussion: "",
      // TODO: add choices based on proposal type
      choices: ["For", "Against", "Abstain"],
      start: Math.floor(
        new Date(proposal.start_date_social ?? new Date()).getTime() / 1000
      ),
      end: Math.floor(
        new Date(
          proposal.end_date_social ??
            new Date(Date.now() + 24 * 60 * 60 * 1000 * 5) // add 24 hours
        ).getTime() / 1000
      ),
      snapshot: blockNumber,
      plugins: JSON.stringify({}),
    };

    const sig = await signTypedDataAsync({
      domain,
      types: proposalTypes,
      primaryType: "Proposal",
      message: message,
    });

    const receipt = (await createProposal(sig, address, message)) as {
      id: string;
    };

    return receipt.id;
  }

  const {
    config,
    isError: onPrepareError,
    error,
  } = usePrepareContractWrite({
    address: "0x630A6A268191c654ce084aAd2D7910fF651e0797",
    abi: ENSGovernorABI,
    functionName: "propose",
    args: inputData,
    chainId: 11155111,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  const handleApprove = async () => {
    if (proposal.proposal_type === "executable") {
      write?.();
    } else {
      const proposalId = await createSnapshot();

      const snapshotLink =
        process.env.REACT_APP_DEPLOY_ENV === "prod"
          ? `https://snapshot.org/#/ens.eth/proposal/${proposalId}`
          : `https://demo.snapshot.org/#/stepandel.eth/proposal/${proposalId}`;

      alert("Snapshot created! " + snapshotLink);
    }
  };

  const handleProposalSubmitted = useCallback(async () => {
    const updatedProposal = await updateProposal(proposal, {
      proposal_status_id: 5,
      onchain_transaction_hash: data?.hash,
    });
  }, [proposal, updateProposal, data]);

  useEffect(() => {
    if (isSuccess) {
      alert("Proposal submitted");
      handleProposalSubmitted();
    }
  }, [isSuccess, handleProposalSubmitted]);

  return (
    <div className="flex-grow">
      <div className="bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] z-10 mx-6">
        <div className="flex flex-row justify-between px-6 text-[#B16B19] text-xs font-medium py-2">
          <p>Your proposal review</p>
          <p>Please review carefully</p>
        </div>
        <div className="pt-6 pb-9 bg-white border border-gray-eb rounded-2xl z-20">
          <div className="flex flex-col gap-y-6 px-6 border-b border-gray-eb pb-8">
            <h3 className="text-2xl font-black">{proposal.title}</h3>
            <div className="bg-[#F7F7F7] rounded-lg border border-gray-eo w-[620px] break-all">
              <p className="stone-500 text-xs pt-3 px-6">
                Proposed transactions
              </p>
              {proposal.transactions.map((transaction, index) => {
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
              <p className="text-gray-4f">{proposal.description}</p>
            </div>
            <div className="flex flex-col gap-y-1 text-base">
              <label className="font-medium">Abstract</label>
              {/* TODO in markdown */}
              <MarkdownPreview
                source={proposal.abstract}
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
          <div className="flex flex-col gap-y-5 text-base px-6 pt-6">
            <DraftProposalFormSubmitChecklist
              proposalState={proposal}
              getProposalChecklist={getProposalChecklist}
            />
            <div className="flex flex-row items-center justify-between">
              <p className="w-[440px] text-stone-700">
                Please make sure to proofread your proposal as it cannot be
                edited once submitted.
              </p>

              <button
                onClick={() => handleApprove()}
                className="flex flex-row justify-center shadow-sm py-3 px-6 bg-black text-white rounded-lg mt-4"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftProposalReview;
