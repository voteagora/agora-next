"use server";

import {
    getProxy,
    getVotingPowerAvailableForDirectDelegation,
    getVotingPowerAvailableForSubdelegation,
    isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getCurrentDelegatees } from "@/app/api/delegations/getDelegations";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { DelegateStatementFormValues } from "@/components/DelegateStatement/DelegateStatementForm";
import { createDelegateStatement } from "@/app/api/delegateStatement/createDelegateStatement";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";

// Pass address of the connected wallet
export async function fetchVotingPowerForSubdelegation(addressOrENSName: string) {
    return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

// Pass address of the connected wallet
export async function checkIfDelegatingToProxy(addressOrENSName: string) {
    return isDelegatingToProxy({ addressOrENSName });
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(addressOrENSName: string) {
    return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
    return getCurrentDelegatees({ addressOrENSName });
}

// Pass address of the connected wallet
export async function getProxyAddress(addressOrENSName: string) {
    return getProxy({ addressOrENSName });
}

export async function fetchDelegate(addressOrENSName: string) {
    "use server";

    return getDelegate({ addressOrENSName });
}

export async function submitDelegateStatement(address: string, values: DelegateStatementFormValues, signature: string) {
    "use server";

    return createDelegateStatement(address, values, signature);
}

export async function fetchDelegateStatement(address: string) {
    "use server";

    return getDelegateStatement(address);
}