"use server";

import { getProposalTypes } from "../api/proposals/getProposals";

export async function fetchProposalTypes() {

    return getProposalTypes();
}