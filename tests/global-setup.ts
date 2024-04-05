import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    const validTenants = ["optimism", "ens", "etherfi", "lyra"];
    const tenant: string = process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME || "";

    if (!validTenants.includes(tenant)) {
        throw new Error(
            `NEXT_PUBLIC_AGORA_INSTANCE_NAME must be one of ${validTenants.join(
                ", "
            )}, but got '${tenant}'`
        );
    }
}

export default globalSetup;