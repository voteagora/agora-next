import { ethers } from "ethers";
import { DraftProposal, ProposalType } from "../types";

type BasicInputData = [`0x${string}`[], bigint[], `0x${string}`[], string];

export function getInputData(proposal: DraftProposal): {
  inputData: BasicInputData;
} {
  const description =
    "# " +
    proposal.title +
    "\n\n" +
    `${
      proposal.temp_check_link &&
      "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
    }` +
    "\n\n ## Abstract \n" +
    proposal.abstract;

  // provide default values for basic proposal
  let targets: `0x${string}`[] = [];
  let values: bigint[] = [];
  let calldatas: `0x${string}`[] = [];
  let inputData: BasicInputData = [targets, values, calldatas, description];
  let options: [bigint, string[], bigint[], string[], string][] = [];

  // Inputs for basic type
  // [targets, values, calldatas, description]
  // [string[], bigint[], string[], string]
  switch (proposal.proposal_type) {
    case ProposalType.BASIC:
      if (proposal.transactions.length === 0) {
        targets.push(ethers.ZeroAddress as `0x${string}`);
        values.push(0n);
        calldatas.push("0x");
      } else {
        proposal.transactions.forEach((t) => {
          targets.push(ethers.getAddress(t.target) as `0x${string}`);
          values.push(ethers.parseEther(t.value.toString() || "0"));
          calldatas.push(t.calldata as `0x${string}`);
        });
      }

    // inputs for approval type
    // [description, options]
    // [bigint, string[],
    case ProposalType.APPROVAL:
      proposal.transactions.forEach((option) => {
        const formattedOption: [bigint, string[], bigint[], string[], string] =
          [BigInt(0), [], [], [], option.description];

        // option.transactions.forEach((t) => {
        //   if (t.type === "Transfer") {
        //     formattedOption[0] += t.transferAmount;
        //     formattedOption[1].push(governanceTokenContract.address);
        //     formattedOption[2].push(BigInt(0));
        //     formattedOption[3].push(
        //       encodeTransfer(t.transferTo, t.transferAmount)
        //     );
        //   } else {
        //     formattedOption[1].push(ethers.getAddress(t.target));
        //     formattedOption[2].push(
        //       ethers.parseEther(t.value.toString() || "0")
        //     );
        //     formattedOption[3].push(t.calldata);
        //   }
        // });

        options.push(formattedOption);
      });
  }

  return { inputData };
}
