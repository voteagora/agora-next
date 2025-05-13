import { bullet, toAddressLink } from "../report";
import type { ProposalCheck } from "../types";
import { Provider } from "ethers";
import { getCodeCached } from "./check-targets-verified-etherscan";

/**
 * Check all targets with code if they contain selfdestruct.
 */
export const checkTargetsNoSelfdestruct: ProposalCheck = {
  name: "Check all targets do not contain selfdestruct",
  async checkProposal(proposal, _, deps) {
    const uniqueTargets = proposal.targets.filter(
      (addr: string, i: number, targets: string[]) =>
        targets.indexOf(addr) === i
    );
    const { info, warn, error } = await checkNoSelfdestructs(
      [deps.governor.address, deps.timelock.address],
      uniqueTargets,
      deps.provider
    );
    return { info, warnings: warn, errors: error };
  },
};

/**
 * Check all touched contracts with code if they contain selfdestruct.
 */
export const checkTouchedContractsNoSelfdestruct: ProposalCheck = {
  name: "Check all touched contracts do not contain selfdestruct",
  async checkProposal(_, sim, deps) {
    const { info, warn, error } = await checkNoSelfdestructs(
      [deps.governor.address, deps.timelock.address],
      sim.transaction.addresses,
      deps.provider
    );
    return { info, warnings: warn, errors: error };
  },
};

/**
 * For a given simulation response, check if a set of addresses contain selfdestruct.
 */
async function checkNoSelfdestructs(
  trustedAddrs: string[],
  addresses: string[],
  provider: Provider
): Promise<{ info: string[]; warn: string[]; error: string[] }> {
  const settledResults = await Promise.allSettled(
    addresses.map(async (addr) => {
      const status = await checkNoSelfdestruct(trustedAddrs, addr, provider);
      const addressLink = toAddressLink(addr, false);
      return { addressLink, status };
    })
  );

  const info: string[] = [];
  const warn: string[] = [];
  const error: string[] = [];

  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      const res = result.value;
      if (res.status === "eoa") info.push(bullet(`${res.addressLink}: EOA`));
      else if (res.status === "empty")
        warn.push(bullet(`${res.addressLink}: EOA (may have code later)`));
      else if (res.status === "safe")
        info.push(bullet(`${res.addressLink}: Contract (looks safe)`));
      else if (res.status === "delegatecall")
        warn.push(bullet(`${res.addressLink}: Contract (with DELEGATECALL)`));
      else if (res.status === "trusted")
        info.push(bullet(`${res.addressLink}: Trusted contract (not checked)`));
      else
        error.push(bullet(`${res.addressLink}: Contract (with SELFDESTRUCT)`));
    } else {
      console.error(
        "Error checking selfdestruct for an address:",
        result.reason
      );
      error.push(bullet(`Error processing an address for selfdestruct check.`));
    }
  }
  return { info, warn, error };
}

const STOP = 0x00;
const JUMPDEST = 0x5b;
const PUSH1 = 0x60;
const PUSH32 = 0x7f;
const RETURN = 0xf3;
const REVERT = 0xfd;
const INVALID = 0xfe;
const SELFDESTRUCT = 0xff;
const DELEGATECALL = 0xf4;

const isHalting = (opcode: number): boolean =>
  [STOP, RETURN, REVERT, INVALID, SELFDESTRUCT].includes(opcode);
const isPUSH = (opcode: number): boolean => opcode >= PUSH1 && opcode <= PUSH32;

/**
 * For a given address, check if it's an EOA, a safe contract, or a contract contain selfdestruct.
 */
async function checkNoSelfdestruct(
  trustedAddrs: string[],
  addr: string,
  provider: Provider
): Promise<
  "safe" | "eoa" | "empty" | "selfdestruct" | "delegatecall" | "trusted"
> {
  if (
    trustedAddrs.map((addr) => addr.toLowerCase()).includes(addr.toLowerCase())
  )
    return "trusted";

  const [code, nonce] = await Promise.all([
    getCodeCached(provider, addr),
    provider.getTransactionCount(addr),
  ]);

  // If there is no code and nonce is > 0 then it's an EOA.
  // If nonce is 0 it is an empty account that might have code later.
  // A contract might have nonce > 0, but then it will have code.
  // If it had code, but was selfdestructed, the nonce should be reset to 0.
  if (code === "0x") return nonce > 0 ? "eoa" : "empty";

  // Detection logic from https://github.com/MrLuit/selfdestruct-detect
  const bytecode = Buffer.from(code.substring(2), "hex");
  let halted = false;
  let delegatecall = false;
  for (let index = 0; index < bytecode.length; index++) {
    const opcode = bytecode[index];
    if (opcode === SELFDESTRUCT && !halted) {
      return "selfdestruct";
    }
    if (opcode === DELEGATECALL && !halted) {
      delegatecall = true;
    }
    if (opcode === JUMPDEST) {
      halted = false;
    }
    if (isHalting(opcode)) {
      halted = true;
    }
    if (isPUSH(opcode)) {
      index += opcode - PUSH1 + 0x01;
    }
  }

  return delegatecall ? "delegatecall" : "safe";
}
