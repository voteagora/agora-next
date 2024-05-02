import { SIWEConfig } from "connectkit";
import { SiweMessage } from "siwe";

// TODO: this should probably be an environment variable
const API_PREFIX = "/api/v1/auth";

export const siweProviderConfig: SIWEConfig = {
  getNonce: async () => fetch(`${API_PREFIX}/nonce`).then((res) => res.text()),
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
    fetch(`${API_PREFIX}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        signature,
      }),
    }).then((res) => res.ok),
  // TODO: define specifically what is returned in yaml; implement
  getSession: async () =>
    fetch(`${API_PREFIX}/session`).then((res) => (res.ok ? res.json() : null)),
  signOut: () => Promise.resolve(true),
};
