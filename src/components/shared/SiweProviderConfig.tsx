import { SIWEConfig } from "connectkit";
import { SiweMessage } from "siwe";
import { decodeJwt } from "jose";

// TODO: this should probably be an environment variable
const API_AUTH_PREFIX = "/api/v1/auth";

const LOCAL_STORAGE_JWT_KEY = "siwe-jwt";

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () =>
    fetch(`${API_AUTH_PREFIX}/nonce`).then((res) => res.text()),
  createMessage: ({ nonce, address, chainId }) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
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
      // save JWT from verify to local storage
      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, await res.json());
      return res.ok;
    }),
  getSession: async () => {
    /*fetch(`${API_AUTH_PREFIX}/session`).then((res) =>
      res.ok ? res.json() : null
    );*/
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
      address: siweData.address as string,
      chainId: Number(siweData.chainId),
    };
  },
  signOut: () => {
    // remove JWT from local storage
    localStorage.removeItem(LOCAL_STORAGE_JWT_KEY);
    return Promise.resolve(true);
  },
};

// There's currently nothing stored on the backend to maintain session state.
// All session state is stateless and stored in the JWT issued by the server.
// Address, nonce, and chainId are all stored in the JWT, along with a particular
// time to live/expiry.
//
// For signOut, the client should remove JWT from storage as applicable, and is otherwise
// a no-op (pending AGORA-2015, or potential JWT-token tracking on our backend DB).
//
// JWT tokens for SIWE should therefore be issued with a short expiry time.
