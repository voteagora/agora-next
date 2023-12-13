export type Delegation = {
  from: string;
  to: string;
  allowance: string;
  timestamp: Date | null;
  type: "DIRECT" | "ADVANCED";
  amount: "FULL" | "PARTIAL";
};
