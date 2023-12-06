// TODO: replace this with real data
const name = "agora.eth";
const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
import { shortAddress } from "@/lib/utils";

export function NounResolvedName({ resolvedName }) {
  if (!name) {
    return <>{shortAddress(address)}</>;
  }

  return <>{name}</>;
}
