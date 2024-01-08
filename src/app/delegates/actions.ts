"use server";

import {
    getProxy,
    getVotingPowerAvailableForDirectDelegation,
    getVotingPowerAvailableForSubdelegation,
    isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getCurrentDelegatees } from "@/app/api/delegations/getDelegations";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/DelegateStatementForm";
import { createDelegateStatement } from "@/app/api/delegateStatement/createDelegateStatement";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";
import { getStatement } from "@/app/api/statements/getStatements";

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
    return getDelegate({ addressOrENSName });
}

export async function submitDelegateStatement(address: string, values: DelegateStatementFormValues, signature: string) {
    return createDelegateStatement(address, values, signature);
}

// TODO: frh -> refactor this in one fetchDelegateStatement
export async function fetchDelegateStatement(address: string) {
    return getDelegateStatement(address);
}

// TODO: frh -> refactor this in one fetchDelegateStatement
export async function fetchDelegateStatementDynamoDB(addressOrENSName: string) {
    return getStatement({ addressOrENSName });
}
