  /**
   * 
   * 
   *
   **/ 
  export async function getQuorumForProposal(proposal, dao, ethProvider) {
    switch (dao) {
      case "NOUN": {
        return 27;
      }
      case "OP": {
        return 30;
      }
    }
  }