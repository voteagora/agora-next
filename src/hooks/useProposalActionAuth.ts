import { useSignMessage } from "wagmi";
import { useCallback } from "react";
import { LOCAL_STORAGE_SIWE_JWT_KEY } from "@/lib/constants";

export const useProposalActionAuth = () => {
  const { signMessageAsync } = useSignMessage();

  const getAuthenticationData = useCallback(
    async (messagePayload: Record<string, any>) => {
      let jwt: string | undefined;
      try {
        const session = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
        const parsed = session ? JSON.parse(session) : null;
        jwt = parsed?.access_token;
      } catch {}

      if (jwt) {
        return { jwt };
      }

      const message = JSON.stringify(messagePayload);
      const signature = await signMessageAsync({ message }).catch(() => undefined);

      if (!signature) {
        return null;
      }

      return { message, signature };
    },
    [signMessageAsync]
  );

  return { getAuthenticationData };
};
