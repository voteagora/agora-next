const FAWKES_URL = "http://127.0.0.1:4000/wallet";

export const FawkesClient = {
  /**
   * Generates a new wallet (from random mnemonic) or impersonates an address.
   */
  async createWallet(options?: { address?: string; mnemonic?: string }) {
    const response = await fetch(`${FAWKES_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: options ? JSON.stringify(options) : undefined,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(`Fawkes create failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Initiates the WalletConnect pairing session.
   * @param uri The wc: connection string extracted from the QR code/button.
   */
  async connect(uri: string) {
    const response = await fetch(`${FAWKES_URL}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri }),
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(`Fawkes connect failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Approves the incoming WalletConnect session.
   */
  async approveSession() {
    const response = await fetch(`${FAWKES_URL}/approve-session`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(`Fawkes approveSession failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Rejects the incoming WalletConnect session.
   */
  async rejectSession() {
    const response = await fetch(`${FAWKES_URL}/reject-session`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(`Fawkes rejectSession failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Approves a transaction / signature request on a FIFO basis.
   */
  async approveRequest(requestId?: string) {
    const response = await fetch(`${FAWKES_URL}/approve-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestId ? JSON.stringify({ requestId }) : undefined,
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(`Fawkes approveRequest failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Rejects a transaction / signature request on a FIFO basis.
   */
  async rejectRequest(requestId?: string) {
    const response = await fetch(`${FAWKES_URL}/reject-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestId ? JSON.stringify({ requestId }) : undefined,
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(`Fawkes rejectRequest failed: ${JSON.stringify(data)}`);
    return data;
  },

  /**
   * Gets the current headless wallet status (pending requests, address, etc).
   */
  async getStatus() {
    const response = await fetch(`${FAWKES_URL}/status`);
    return response.json();
  },
};
