import { ethers } from "ethers";
import { NOUNS_GOVERNOR_CURRENT } from "./contracts/contracts";

/**
 *
 *
 *
 **/
export async function getQuorumForProposal(proposal, dao, ethProvider) {
  switch (dao) {
    case "NOUN": {
      let result = 0;
      let contract = new ethers.Contract(
        NOUNS_GOVERNOR_CURRENT.address,
        NOUNS_GOVERNOR_CURRENT.abi,
        ethProvider
      );
      result = await contract.quorumVotes(proposal.uuid);
      return Number(result);
    }
    case "OP": {
      return 30;
    }
  }
}
