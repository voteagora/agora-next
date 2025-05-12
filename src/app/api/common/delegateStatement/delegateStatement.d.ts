import { DelegateStatements } from "@prisma/client";

export type DelegateStatement = Omit<
  DelegateStatements,
  "createdAt" | "updatedAt" | "signature" | "dao_slug"
>;

export type MessageOrMessageHash =
  | { type: "MESSAGE"; value: string }
  | { type: "MESSAGE_HASH"; value: string };
