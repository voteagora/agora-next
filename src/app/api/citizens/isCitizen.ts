import { isCitizenForNamespace } from "../common/citizens/isCitizen";

export const isCitizen = (address: string) =>
  isCitizenForNamespace(address, "optimism");
