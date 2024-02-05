import { getVotableSupplyForNamespace } from "../common/votableSupply/getVotableSupply";

export const getVotableSupply = () =>
  getVotableSupplyForNamespace({ namespace: "optimism" });
