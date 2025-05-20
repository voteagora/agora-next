import { DelegateStatements } from "@prisma/client";

export type DelegateStatement = Omit<
  DelegateStatements,
  "signature" | "dao_slug" | "stage"
>;
