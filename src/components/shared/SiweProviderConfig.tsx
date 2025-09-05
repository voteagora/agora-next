import { SIWEConfig } from "connectkit";
import { LOCAL_STORAGE_SIWE_JWT_KEY } from "@/lib/constants";
import { SiweMessage } from "siwe";
import { decodeJwt } from "jose";

// TODO: this should probably be an environment variable
const API_AUTH_PREFIX = "/api/v1/auth";
const LOCAL_STORAGE_JWT_KEY = LOCAL_STORAGE_SIWE_JWT_KEY;
const AGORA_SIGN_IN = "Sign in to Agora with Ethereum";

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

const isSiweEnabled = () => {
  return process.env.NEXT_PUBLIC_SIWE_ENABLED === "true";
};

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () =>
    fetch(`${API_AUTH_PREFIX}/nonce`).then(async (res) => {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        return data?.nonce ?? "";
      }
      return res.text();
    }),
  createMessage: ({ nonce, address, chainId }) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      statement: AGORA_SIGN_IN,
      address,
      chainId,
      nonce,
    }).prepareMessage(),
  verifyMessage: async ({ message, signature }) =>
    (function () {
      try {
        localStorage.setItem("agora-siwe-stage", "awaiting_response");
      } catch {}
      return fetch(`${API_AUTH_PREFIX}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          signature,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          // Avoid JSON parse errors on non-JSON error bodies
          try {
            localStorage.setItem("agora-siwe-stage", "error");
          } catch {}
          return false;
        }
        // save JWT from verify to local storage (expect JSON on success)
        try {
          const token = await res.json();
          localStorage.setItem(LOCAL_STORAGE_JWT_KEY, JSON.stringify(token));
          try {
            localStorage.setItem("agora-siwe-stage", "signed");
          } catch {}
        } catch {
          // ignore if body isn't JSON for some reason
        }
        return true;
      });
    })(),
  getSession: async () => {
    // return JWT from local storage
    const session = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
    if (!session) {
      return null;
    }
    const jwt = JSON.parse(session).access_token;
    // decode JWT to get session info
    const decoded = decodeJwt(jwt);
    const siweData = decoded.siwe as { address: string; chainId: string };
    return {
      address: siweData.address as `0x${string}`,
      chainId: Number(siweData.chainId),
    };
  },
  signOut: () => {
    // remove JWT from local storage
    localStorage.removeItem(LOCAL_STORAGE_JWT_KEY);
    return Promise.resolve(true);
  },
  enabled: isSiweEnabled(),
};
