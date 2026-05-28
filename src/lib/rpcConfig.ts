const RPC_ENDPOINT_BASE_URL = "https://edge.goldsky.com/standard/evm";

const getServerRpcSecret = (): string | undefined => {
  const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
  const prodSecret = process.env.SERVERSIDE_RPC_SECRET_PROD;
  const devSecret = process.env.SERVERSIDE_RPC_SECRET_DEV;

  if (isProd) {
    return prodSecret || devSecret;
  }

  return devSecret;
};

export const getRpcSecret = (): string => {
  if (typeof window !== "undefined") {
    const secret = process.env.NEXT_PUBLIC_RPC_SECRET;
    if (!secret) {
      throw new Error("NEXT_PUBLIC_RPC_SECRET is not defined");
    }
    return secret;
  }

  const serverSecret = getServerRpcSecret();
  if (serverSecret) {
    return serverSecret;
  }

  const clientSecret = process.env.NEXT_PUBLIC_RPC_SECRET;
  if (clientSecret) {
    const envName =
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
        ? "SERVERSIDE_RPC_SECRET_PROD"
        : "SERVERSIDE_RPC_SECRET_DEV";

    console.warn(
      `${envName} not configured, falling back to NEXT_PUBLIC_RPC_SECRET. ` +
        `For production, set ${envName} to avoid exposing server-side credentials.`
    );
    return clientSecret;
  }

  throw new Error("No RPC secret configured");
};

export const getRpcUrl = (
  chainId: number | string,
  secret = getRpcSecret()
): string => {
  const numericChainId = Number(chainId);

  if (!Number.isInteger(numericChainId) || numericChainId <= 0) {
    throw new Error(`Invalid chain id for RPC: ${String(chainId)}`);
  }

  return `${RPC_ENDPOINT_BASE_URL}/${numericChainId}?secret=${encodeURIComponent(
    secret
  )}`;
};

export const getRpcUrlForChain = (
  chainId: number | string,
  secret?: string
): string => {
  if (process.env.NEXT_PUBLIC_FORK_NODE_URL) {
    return process.env.NEXT_PUBLIC_FORK_NODE_URL;
  }

  return getRpcUrl(chainId, secret ?? getRpcSecret());
};
