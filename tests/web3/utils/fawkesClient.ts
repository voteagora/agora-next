function buildFawkesClient(baseUrl: string) {
  return {
    async createWallet(options?: { address?: string; mnemonic?: string }) {
      const response = await fetch(`${baseUrl}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: options ? JSON.stringify(options) : undefined,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(`Fawkes create failed: ${JSON.stringify(data)}`);
      return data;
    },

    async connect(uri: string) {
      const response = await fetch(`${baseUrl}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri }),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(`Fawkes connect failed: ${JSON.stringify(data)}`);
      return data;
    },

    async approveSession() {
      const response = await fetch(`${baseUrl}/approve-session`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(
          `Fawkes approveSession failed: ${JSON.stringify(data)}`
        );
      return data;
    },

    async rejectSession() {
      const response = await fetch(`${baseUrl}/reject-session`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(`Fawkes rejectSession failed: ${JSON.stringify(data)}`);
      return data;
    },

    async approveRequest(requestId?: string) {
      const response = await fetch(`${baseUrl}/approve-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestId ? JSON.stringify({ requestId }) : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(
          `Fawkes approveRequest failed: ${JSON.stringify(data)}`
        );
      return data;
    },

    /** Alias for approveRequest — used in on-chain submission flows. */
    async confirmTransaction(requestId?: string) {
      return this.approveRequest(requestId);
    },

    async rejectRequest(requestId?: string) {
      const response = await fetch(`${baseUrl}/reject-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestId ? JSON.stringify({ requestId }) : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(`Fawkes rejectRequest failed: ${JSON.stringify(data)}`);
      return data;
    },

    async getStatus() {
      const response = await fetch(`${baseUrl}/status`);
      return response.json();
    },
  };
}

/** Default Fawkes client used by the standard test suite (port 4000). */
export const FawkesClient = buildFawkesClient("http://127.0.0.1:4000/wallet");

/** Factory for tests that need a dedicated Fawkes instance (e.g. on-chain tests on port 4001). */
export function createFawkesClient(port: number) {
  return buildFawkesClient(`http://127.0.0.1:${port}/wallet`);
}
