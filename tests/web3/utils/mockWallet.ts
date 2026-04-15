import { Page } from "@playwright/test";
import { ethers } from "ethers";

export class MockWallet {
  public wallet: ethers.HDNodeWallet | ethers.Wallet;
  public address: string;

  constructor(privateKey?: string) {
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey);
    } else {
      this.wallet = ethers.Wallet.createRandom();
    }
    this.address = this.wallet.address;
  }

  /**
   * Injects a fully functional EIP-1193 Mock window.ethereum
   * into the Playwright page. It handles accounts and personal_sign using ethers.
   */
  async inject(page: Page, chainId: number = 10) {
    // Expose Node.js signing so the browser mock can use it
    await page.exposeFunction("mockWalletSignMessage", async (messageHex: string) => {
      console.log(`Node.js signing message...`);
      try {
        const messageStr = ethers.toUtf8String(messageHex);
        console.log(`Node.js decoded message: ${messageStr}`);
        const sig = await this.wallet.signMessage(messageStr);
        console.log(`Node.js signature generated: ${sig}`);
        return sig;
      } catch (err) {
        console.error("Node.js signMessage error:", err);
        throw err;
      }
    });

    await page.exposeFunction("mockWalletSignTypedData", async (domain: any, types: any, value: any) => {
      return await this.wallet.signTypedData(domain, types, value);
    });

    // We pass dynamic values as args to the init script
    await page.addInitScript(
      ({ address, chainIdHex }) => {
        window.ethereum = ({
          isMetaMask: true,
          request: async ({ method, params }: { method: string; params?: any }) => {
            console.log("Mock Wallet Request:", method, params);
            switch (method) {
              case "eth_requestAccounts":
              case "eth_accounts":
                return [address];
              case "eth_chainId":
                return chainIdHex;
              case "net_version":
                return parseInt(chainIdHex, 16).toString();
              case "personal_sign":
                // params[0] is the message hex, params[1] is the address
                return await (window as any).mockWalletSignMessage(params[0]);
              case "eth_signTypedData_v4":
                const parsed = JSON.parse(params[1]);
                return await (window as any).mockWalletSignTypedData(
                  parsed.domain,
                  parsed.types,
                  parsed.message
                );
              case "wallet_switchEthereumChain":
              case "wallet_addEthereumChain":
                return null; // acknowledge success
              default:
                // Return generic success for unsupported to prevent crashing RainbowKit
                console.warn(`MockWallet: Unhandled method ${method}`, params);
                if (method.startsWith("eth_")) return "0x0";
                return null;
            }
          },
          on: (event: string, callback: any) => {
            console.log(`Mock Wallet listener attached: ${event}`);
          },
          removeListener: () => {},
          autoRefreshOnNetworkChange: false,
        } as any);
      },
      { address: this.address, chainIdHex: "0x" + chainId.toString(16) }
    );
  }
}
