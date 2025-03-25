import type { ProposalCheck } from "../types";
import { checkDecodeCalldata } from "./check-decode-calldata";
import { checkEthBalanceChanges } from "./check-eth-balance-changes";
import { checkLogs } from "./check-logs";
import { checkStateChanges } from "./check-state-changes";
import {
  checkTargetsNoSelfdestruct,
  checkTouchedContractsNoSelfdestruct,
} from "./check-targets-no-selfdestruct";
import {
  checkTargetsVerifiedEtherscan,
  checkTouchedContractsVerifiedEtherscan,
} from "./check-targets-verified-etherscan";
import { checkValueRequired } from "./check-value-required";

const ALL_CHECKS: {
  [checkId: string]: ProposalCheck;
} = {
  checkStateChanges,
  checkDecodeCalldata,
  checkLogs,
  checkTargetsVerifiedEtherscan,
  checkTouchedContractsVerifiedEtherscan,
  checkTargetsNoSelfdestruct,
  checkTouchedContractsNoSelfdestruct,
  checkValueRequired,
  checkEthBalanceChanges,
  // Solc and slither checks disabled for now
  // checkSolc,
  // checkSlither,
};

export default ALL_CHECKS;
