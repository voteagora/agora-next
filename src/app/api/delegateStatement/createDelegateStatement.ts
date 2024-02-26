import { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { createDelegateStatementForNamespace } from "../common/delegateStatement/createDelegateStatement";

export const createDelegateStatement = ({
  address,
  delegateStatement,
  signature,
  message,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
}) =>
  createDelegateStatementForNamespace({
    address,
    delegateStatement,
    signature,
    message,
    namespace: "optimism",
  });
