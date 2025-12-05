"use server";

import { getDelegateDataFromDaoNode } from "./client";

export const getDelegateVotingPowerFromDaoNode = async (
  address: string
): Promise<string | null> => {
  const delegateData = await getDelegateDataFromDaoNode(address);
  return delegateData?.delegate?.voting_power ?? null;
};
