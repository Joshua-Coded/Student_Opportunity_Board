// MetaMask / window.ethereum utilities for OpportunityBoard payments

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export type MetaMaskError = { code: number; message: string };

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
}

// Connect wallet — returns the connected account address
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install it from metamask.io");
  }

  const accounts: string[] = await window.ethereum!.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from MetaMask.");
  }

  return accounts[0];
}

// Get currently connected account without prompting
export async function getConnectedAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  const accounts: string[] = await window.ethereum!.request({
    method: "eth_accounts",
  });

  return accounts.length > 0 ? accounts[0] : null;
}

// Switch to Sepolia testnet (chainId 0xaa36a7 = 11155111)
export async function switchToSepolia(): Promise<void> {
  if (!isMetaMaskInstalled()) throw new Error("MetaMask not installed.");

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (err: any) {
    // Chain not added yet — add it
    if (err.code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia Testnet",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/fJ8QpNHpso79z1xgPtVo0"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export interface TxParams {
  from: string;
  to: string;
  value: string;
  gas: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  chainId: string;
}

// Send a payment via MetaMask using tx params from the MCP prepare_payment tool
export async function sendPaymentViaMetaMask(txParams: TxParams): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  const txHash: string = await window.ethereum!.request({
    method: "eth_sendTransaction",
    params: [txParams],
  });

  return txHash;
}

// Parse TX_PARAMS JSON from MCP prepare_payment tool response text
export function parseTxParamsFromMCP(mcpResponseText: string): TxParams | null {
  const match = mcpResponseText.match(/TX_PARAMS:\s*(\{.+\})/s);
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as TxParams;
  } catch {
    return null;
  }
}
