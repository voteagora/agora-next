import { SIWEConfig } from "connectkit";
import { SiweMessage } from "siwe";
import { decodeJwt } from "jose";
import {
  LOCAL_STORAGE_SIWE_JWT_KEY,
  LOCAL_STORAGE_SIWE_STAGE_KEY,
} from "@/lib/constants";

// TODO: this should probably be an environment variable
const API_AUTH_PREFIX = "/api/v1/auth";
export const AGORA_SIGN_IN_MESSAGE = "Sign in to Agora with Ethereum";

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

const isSiweEnabled = () => false;

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () =>
    fetch(`${API_AUTH_PREFIX}/nonce`).then((res) => res.text()),
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
  verifyMessage: async ({ message, signature }) =>
    fetch(`${API_AUTH_PREFIX}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        signature,
      }),
    }).then(async (res) => {
      try {
        const token = await res.json();
        if (token.access_token) {
          localStorage.setItem(LOCAL_STORAGE_SIWE_JWT_KEY, token.access_token);
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "signed");
        } else {
          localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
        }
      } catch (e) {
        localStorage.setItem(LOCAL_STORAGE_SIWE_STAGE_KEY, "error");
      }
      return res.ok;
    }),
  getSession: async () => {
    // return JWT from local storage
    const jwt = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
    if (!jwt) {
      return null;
    }
    // decode JWT to get session info
    const decoded = decodeJwt(jwt);
    const siweData = decoded.siwe as { address: string; chainId: string };
    return {
      address: siweData.address as `0x${string}`,
      chainId: Number(siweData.chainId),
    };
  },
  signOut: () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SIWE_JWT_KEY);
      localStorage.removeItem(LOCAL_STORAGE_SIWE_STAGE_KEY);
    } catch (e) {
      // ignore localStorage errors
    }
    return Promise.resolve(true);
  },
  enabled: isSiweEnabled(),
};
