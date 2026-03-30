export type DelegateStatementAuthPayload = {
  kind: "siwe_jwt";
  jwt: string;
};

export function isDelegateStatementSiweAuthMode() {
  return true;
}
