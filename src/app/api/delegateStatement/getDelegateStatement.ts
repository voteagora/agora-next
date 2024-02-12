import { getDelegateStatementForNamespace } from "../common/delegateStatement/getDelegateStatement";

export const getDelegateStatement = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getDelegateStatementForNamespace({ addressOrENSName, namespace: "optimism" });
