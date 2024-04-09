"use server";

import { fetchProposalTypes as apiFetchPropTyposales } from "@/app/api/common/proposals/getProposals";

export async function fetchProposalTypes() {
  return apiFetchPropTyposales();
}
