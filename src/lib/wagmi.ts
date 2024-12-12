import { cookies } from "next/headers";

export function getConnectedAccountFromCookies(): `0x${string}` | undefined {
  const cookieStore = cookies();
  const wagmiStore = cookieStore.get("wagmi.store");

  if (!wagmiStore?.value) return undefined;

  try {
    const wagmiStoreJson = JSON.parse(wagmiStore.value);
    return wagmiStoreJson?.state?.connections?.value[0]?.[1]
      ?.accounts?.[0] as `0x${string}`;
  } catch (e) {
    console.error("Error parsing wagmi store:", e);
    return undefined;
  }
}
