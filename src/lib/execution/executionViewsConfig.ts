const EXECUTION_ORDER = ["events", "state"] as const;
export type ExecutionViewId = (typeof EXECUTION_ORDER)[number];

const VIEWS = {
  events: {
    pathSegment: "events",
    tabLabel: "Event logs",
    pageEyebrow: "Receipt",
    pageTitle: "Event logs",
    lead: "What contracts emitted: named events and fields (explorer ABI, plus a few built-in layouts for timelock/bridge). Raw hex lives under each log.",
    cardTitle: "Event logs",
    cardDescription:
      "Decoded fields, friendly addresses, and raw hex when needed",
  },
  state: {
    pathSegment: "state",
    tabLabel: "State & trace",
    pageEyebrow: "Trace",
    pageTitle: "State & trace",
    lead: "High-signal log summaries, token moves, and internal ETH transfers and the call tree.",
    cardTitle: "State & trace",
    cardDescription:
      "Action summaries, bridge/messenger envelopes, token transfers, and callTracer output.",
  },
} satisfies Record<
  ExecutionViewId,
  {
    pathSegment: string;
    tabLabel: string;
    pageEyebrow: string;
    pageTitle: string;
    lead: string;
    cardTitle: string;
    cardDescription: string;
  }
>;

export const EXECUTION_VIEWS: typeof VIEWS = VIEWS;

export function getExecutionView(id: ExecutionViewId) {
  return VIEWS[id];
}

export function listExecutionViewIds(): ExecutionViewId[] {
  return [...EXECUTION_ORDER];
}

export function executionTxViewPath(
  txHash: string,
  view: ExecutionViewId
): string {
  return `/execution/tx/${txHash}/${VIEWS[view].pathSegment}`;
}

export function parseExecutionViewFromPathname(
  pathname: string
): ExecutionViewId | null {
  if (pathname.endsWith("/events")) {
    return "events";
  }
  if (pathname.endsWith("/state")) {
    return "state";
  }
  return null;
}

type LogLike = { eventName: string | null };

export type StateInspectionSection = {
  id: string;
  title: string;
  subtitle: string;
  emptyLabel: string;
  include: (log: LogLike) => boolean;
};

export const STATE_INSPECTION_SECTIONS: StateInspectionSection[] = [
  {
    id: "execution-actions",
    title: "Action execution",
    subtitle:
      "Timelock / governor-style execution and proposal-settled signals.",
    emptyLabel: "No matching execution or outcome events.",
    include: (log) =>
      log.eventName === "ExecuteTransaction" ||
      log.eventName === "ProposalExecuted",
  },
  {
    id: "interop",
    title: "Interop & messaging",
    subtitle:
      "Deposits and L1↔L2 message envelopes we recognize in the log stream.",
    emptyLabel: "No bridge or messenger events matched this layout.",
    include: (log) => {
      const n = log.eventName;
      if (!n) {
        return false;
      }
      if (n === "SentMessageExtension1") {
        return false;
      }
      return n === "TransactionDeposited" || n === "SentMessage";
    },
  },
];
