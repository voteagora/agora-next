"use server";

import {
    getVotesForProposalAndDelegate,
    getVotesForProposal,
} from "@/app/api/votes/getVotes";
import {
    getProxy,
    getVotingPowerAtSnapshot,
    getVotingPowerAvailableForDirectDelegation,
    getVotingPowerAvailableForSubdelegation,
    isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getAuthorityChains } from "@/app/api/authority-chains/getAuthorityChains";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";
import {
    getCurrentDelegatees,
    getCurrentDelegators,
    getDirectDelegatee,
} from "@/app/api/delegations/getDelegations";


export async function fetchProposalVotes(proposal_id: string, page = 1) {

    return await getVotesForProposal({ proposal_id, page });
}

export async function fetchVotingPower(
    addressOrENSName: string | `0x${string}`,
    blockNumber: number
) {
    return getVotingPowerAtSnapshot({ blockNumber, addressOrENSName });
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(
    addressOrENSName: string | `0x${string}`
) {
    return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

export async function fetchAuthorityChains(
    address: string | `0x${string}`,
    blockNumber: number
) {
    return {
        chains: await getAuthorityChains({
            blockNumber,
            address,
        }),
    };
}

export async function fetchDelegate(addressOrENSName: string | `0x${string}`) {
    return await getDelegate({
        addressOrENSName,
    });
}

export async function fetchDelegateStatement(
    addressOrENSName: string | `0x${string}`
) {
    return await getDelegateStatement({
        addressOrENSName,
    });
}

export async function fetchVotesForProposalAndDelegate(
    proposal_id: string,
    address: string | `0x${string}`
) {
    return await getVotesForProposalAndDelegate({
        proposal_id,
        address,
    });
}

export async function fetchVotingPowerForSubdelegation(
    addressOrENSName: string | `0x${string}`
) {
    return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

export async function checkIfDelegatingToProxy(
    addressOrENSName: string | `0x${string}`
) {
    return isDelegatingToProxy({ addressOrENSName });
}

export async function fetchCurrentDelegatees(
    addressOrENSName: string | `0x${string}`
) {
    return getCurrentDelegatees({ addressOrENSName });
}

export async function fetchDirectDelegatee(addressOrENSName: string | `0x${string}`) {
    return getDirectDelegatee({ addressOrENSName });
}

export async function getProxyAddress(addressOrENSName: string | `0x${string}`) {
    return getProxy({ addressOrENSName });
}

export async function getDelegators(addressOrENSName: string | `0x${string}`) {
    return getCurrentDelegators({ addressOrENSName });
}