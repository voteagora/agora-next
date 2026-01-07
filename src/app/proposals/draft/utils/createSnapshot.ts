import { getWalletClient, getPublicClient } from "@/lib/viem";
import { ProposalDraft } from "@prisma/client";
import crossFetch from "cross-fetch";
import Tenant from "@/lib/tenant/tenant";
import { mainnet } from "viem/chains";
import { isMainContractDeployment } from "@/lib/envConfig";

export const proposalTypes = {
  Proposal: [
    { name: "from", type: "address" },
    { name: "space", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "type", type: "string" },
    { name: "title", type: "string" },
    { name: "body", type: "string" },
    { name: "discussion", type: "string" },
    { name: "choices", type: "string[]" },
    { name: "start", type: "uint64" },
    { name: "end", type: "uint64" },
    { name: "snapshot", type: "uint64" },
    { name: "plugins", type: "string" },
  ],
};

export type ProposalType =
  | "single-choice"
  | "approval"
  | "quadratic"
  | "ranked-choice"
  | "weighted"
  | "basic";

const NAME = "snapshot";
const VERSION = "0.1.4";

export const domain = {
  name: NAME,
  version: VERSION,
  // chainId: 1
};

const hub = isMainContractDeployment()
  ? "https://hub.snapshot.org/api/msg"
  : "https://testnet.hub.snapshot.org/api/msg";

export interface SnapshotProposalMessage {
  from?: string;
  space: string;
  timestamp?: number;
  type: string;
  title: string;
  body: string;
  discussion: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: number;
  plugins: string;
}

export async function createSnapshot({
  address,
  proposal,
}: {
  address: string | null;
  proposal: ProposalDraft;
}) {
  const tenant = Tenant.current();
  const walletClient = getWalletClient(tenant.contracts.token.chain.id);
  const publicClient = getPublicClient(mainnet);

  if (!address) {
    throw new Error("address not available");
  }

  const description =
    `${
      proposal.temp_check_link &&
      "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
    }` +
    "\n\n ## Description \n" +
    proposal.abstract;

  const blockNumber = await publicClient.getBlockNumber();
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const message: SnapshotProposalMessage & { [key: string]: unknown } = {
    from: address!,
    space:
      process.env.REACT_APP_DEPLOY_ENV === "prod"
        ? "ens.eth"
        : (process.env.TESTNET_SNAPSHOT_SPACE ?? "michaelagora.eth"),
    timestamp,
    type:
      proposal.voting_module_type === "basic" ? "single-choice" : "approval",
    title: proposal.title,
    body: description,
    discussion: "",
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
    snapshot: parseInt(blockNumber.toString()) - 1,
    plugins: JSON.stringify({}),
  };

  const sig = await walletClient.signTypedData({
    account: address as `0x${string}`,
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

export async function sign(
  sig: any,
  address: string,
  message: SnapshotProposalMessage,
  types: any
) {
  if (!message.timestamp)
    message.timestamp = parseInt((Date.now() / 1e3).toFixed());
  const data: any = { domain, types, message };
  return await send({ address: address, sig, data });
}

export async function send(envelop: any) {
  const init = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envelop),
  };
  return new Promise((resolve, reject) => {
    crossFetch(hub, init)
      .then((res) => {
        if (res.ok) return resolve(res.json());
        throw res;
      })
      .catch((e) => {
        console.log(e);
      });
    // .catch((e) => e.json().then((json: any) => reject(json)));
  });
}

export async function createProposal(
  sig: any,
  address: string,
  message: SnapshotProposalMessage
) {
  return await sign(sig, address, message, proposalTypes);
}
