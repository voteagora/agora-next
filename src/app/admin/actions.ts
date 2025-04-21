"use server";

import {
  fetchProposalTypes as apiFetchPropTyposales,
  fetchScopes as apiFetchScopes,
} from "@/app/api/common/proposals/getProposals";

export async function fetchProposalTypes() {
  return apiFetchPropTyposales();
}

export async function fetchScopes() {
  return apiFetchScopes();
}
