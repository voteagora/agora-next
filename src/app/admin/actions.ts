"use server";


import { getProposalTypes } from "@/app/api/common/proposals/getProposals";

export async function fetchProposalTypes() {
    return getProposalTypes()
}