import { OptimismDelegatees } from "@prisma/client";

export type DelegateePayload = OptimismDelegatees;

export type Delegation = {
  from: string;
  to: string;
  allowance: string;
  timestamp: Date | null;
  type: "DIRECT" | "ADVANCED";
  amount: "FULL" | "PARTIAL";
  transaction_hash: string;
};
