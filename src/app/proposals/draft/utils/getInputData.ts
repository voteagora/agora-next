import { ethers } from "ethers";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";

type BasicInputData = [`0x${string}`[], bigint[], `0x${string}`[], string];

export function getInputData(
  proposal: ProposalDraft & { transactions: ProposalDraftTransaction[] }
): {
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

  // TODO: validate transastion data
  try {
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
  } catch (e) {}

  return { inputData };
}
