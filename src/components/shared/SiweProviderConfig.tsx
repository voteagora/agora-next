import { SIWEConfig } from "connectkit";
import { SiweMessage } from "siwe";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";
import { clearStoredSiweSession, getStoredSiweSession } from "@/lib/siweSession";

const API_AUTH_PREFIX = "/api/v1/auth";

const LOCAL_STORAGE_JWT_KEY = LOCAL_STORAGE_SIWE_JWT_KEY;
export const AGORA_SIGN_IN_MESSAGE = "Sign in to Agora with Ethereum";

const SIWE_ENABLED = process.env.NEXT_PUBLIC_SIWE_ENABLED === "true";

/* There's currently nothing stored on the backend to maintain session state.
// All session state is stateless and stored in the JWT issued by the server.
// Address, nonce, and chainId are all stored in the JWT, along with a particular
// time to live/expiry.
//
// For signOut, the client should remove JWT from storage as applicable, and is otherwise
// a no-op (pending AGORA-2015, or potential JWT-token tracking on our backend DB).
//
// JWT tokens for SIWE should therefore be issued with a short expiry time.
*/

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () =>
    fetch(`${API_AUTH_PREFIX}/nonce`)
      .then((res) => res.json())
      .then((data) => data?.nonce ?? ""),
  createMessage: ({ nonce, address, chainId }) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      statement: AGORA_SIGN_IN_MESSAGE,
      address,
      chainId,
      nonce,
    }).prepareMessage(),
  verifyMessage: async ({ message, signature }) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "awaiting_response");
    } catch {}
    const res = await fetch(`${API_AUTH_PREFIX}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });
    if (!res.ok) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      return false;
    }
    try {
      const token = await res.json();
      if (!token || !token.access_token) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
        } catch {}
        return false;
      }
      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, JSON.stringify(token));
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
      } catch {}
      return true;
    } catch {
      try {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      } catch {}
      return false;
    }
  },
  getSession: async () => {
    const session = getStoredSiweSession();
    if (!session) return null;
    return { address: session.address, chainId: session.chainId };
  },
  signOut: () => {
    // remove SIWE session data from local storage
    clearStoredSiweSession();
    return Promise.resolve(true);
  },
  enabled: SIWE_ENABLED,
};
