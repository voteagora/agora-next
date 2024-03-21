import { OptimismDelegatees } from "@prisma/client";

export type DelegateePayload = OptimismDelegatees;

export type Delegation = {
  from: string;
  to: string;
  allowance: string;
  timestamp: Date | null;
  type: "DIRECT" | "ADVANCED";
  amount: "FULL" | "PARTIAL";
};

export type AdvancedDelegationPayload = {
  block_number: number;
  delegated_amount: number;
  delegated_share: number;
  from: number;
  to: string;
};
