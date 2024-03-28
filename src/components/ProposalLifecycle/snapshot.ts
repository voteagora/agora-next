import crossFetch from "cross-fetch";

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

const hub =
  process.env.REACT_APP_DEPLOY_ENV === "prod"
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
