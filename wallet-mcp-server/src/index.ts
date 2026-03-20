import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ethers } from "ethers";
import { z } from "zod";

// -----------------------------------------------------------
// CONFIG
// -----------------------------------------------------------
const RPC_URL =
  process.env.RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/fJ8QpNHpso79z1xgPtVo0";
const NETWORK = process.env.NETWORK || "sepolia";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const server = new McpServer({
  name: "wallet-mcp-server",
  version: "1.0.0",
});

// -----------------------------------------------------------
// HELPER: Etherscan base URL
// -----------------------------------------------------------
function etherscanBase(network: string): string {
  return network === "mainnet"
    ? "https://api.etherscan.io"
    : `https://api-${network}.etherscan.io`;
}

// -----------------------------------------------------------
// TOOL 1: validate_address
// Always call this before any payment to prevent fat-finger errors.
// -----------------------------------------------------------
server.tool(
  "validate_address",
  "Check if a string is a valid Ethereum wallet address. Always call this before any payment.",
  { address: z.string().describe("Address string to validate") },
  async ({ address }) => {
    const isValid = ethers.isAddress(address);
    return {
      content: [
        {
          type: "text",
          text: isValid
            ? `${address} is a valid Ethereum address.`
            : `${address} is NOT a valid Ethereum address.`,
        },
      ],
    };
  }
);

// -----------------------------------------------------------
// TOOL 2: get_balance
// Check if a wallet has enough ETH before attempting payment.
// -----------------------------------------------------------
server.tool(
  "get_balance",
  "Get the ETH balance of any wallet address",
  { address: z.string().describe("Ethereum wallet address (0x...)") },
  async ({ address }) => {
    try {
      const balance = await provider.getBalance(address);
      const eth = ethers.formatEther(balance);
      return {
        content: [{ type: "text", text: `Balance for ${address}: ${eth} ETH` }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// -----------------------------------------------------------
// TOOL 3: estimate_gas
// Always call before send_payment or prepare_payment so the
// user sees the fee before confirming.
// -----------------------------------------------------------
server.tool(
  "estimate_gas",
  "Estimate the gas fee for an ETH transfer. Show this to the user before they confirm payment.",
  {
    from: z.string().describe("Sender wallet address"),
    to: z.string().describe("Recipient wallet address"),
    amount_eth: z.string().describe("Amount in ETH to send (e.g. '0.01')"),
  },
  async ({ from, to, amount_eth }) => {
    try {
      const value = ethers.parseEther(amount_eth);
      const gasEstimate = await provider.estimateGas({ from, to, value });
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice ?? 0n;
      const gasCostWei = gasEstimate * gasPrice;
      const gasCostEth = ethers.formatEther(gasCostWei);

      return {
        content: [
          {
            type: "text",
            text:
              `Estimated gas for sending ${amount_eth} ETH:\n` +
              `Gas units: ${gasEstimate.toString()}\n` +
              `Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei\n` +
              `Estimated fee: ${gasCostEth} ETH`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// -----------------------------------------------------------
// TOOL 4: prepare_payment (MetaMask flow — PRODUCTION)
// Returns unsigned tx params. The frontend passes these to
// MetaMask (window.ethereum.request) so the USER signs with
// their own wallet. Server never touches private keys.
// -----------------------------------------------------------
server.tool(
  "prepare_payment",
  "Prepare an unsigned ETH transaction for MetaMask signing on the frontend. Use this in production — the user signs with their own wallet.",
  {
    from: z.string().describe("Sender wallet address (the connected MetaMask account)"),
    to: z.string().describe("Recipient wallet address"),
    amount_eth: z.string().describe("Amount in ETH to send (e.g. '0.05')"),
    note: z.string().optional().describe("Optional payment note for logging"),
  },
  async ({ from, to, amount_eth, note }) => {
    try {
      // Validate both addresses first
      if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
        return {
          content: [{ type: "text", text: "Error: Invalid from or to address." }],
          isError: true,
        };
      }

      const value = ethers.parseEther(amount_eth);
      const feeData = await provider.getFeeData();
      const gasEstimate = await provider.estimateGas({ from, to, value });
      const nonce = await provider.getTransactionCount(from, "latest");
      const network = await provider.getNetwork();

      // Build tx params formatted for MetaMask eth_sendTransaction
      const txParams = {
        from,
        to,
        value: "0x" + value.toString(16),
        gas: "0x" + gasEstimate.toString(16),
        maxFeePerGas: feeData.maxFeePerGas
          ? "0x" + feeData.maxFeePerGas.toString(16)
          : undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
          ? "0x" + feeData.maxPriorityFeePerGas.toString(16)
          : undefined,
        nonce: "0x" + nonce.toString(16),
        chainId: "0x" + network.chainId.toString(16),
      };

      const summary =
        `Payment prepared for MetaMask signing:\n` +
        `From: ${from}\n` +
        `To: ${to}\n` +
        `Amount: ${amount_eth} ETH\n` +
        `Estimated gas: ${ethers.formatEther(gasEstimate * (feeData.gasPrice ?? 0n))} ETH\n` +
        (note ? `Note: ${note}\n` : "") +
        `\nTX_PARAMS: ${JSON.stringify(txParams)}`;

      return { content: [{ type: "text", text: summary }] };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// -----------------------------------------------------------
// TOOL 5: send_payment (server-side signing — DEV/TESTNET ONLY)
// Uses SENDER_PRIVATE_KEY from env. Never use with real user
// funds in production. Use prepare_payment + MetaMask instead.
// -----------------------------------------------------------
server.tool(
  "send_payment",
  "DEV/TESTNET ONLY: Sign and broadcast an ETH payment using a server-managed private key. For production use prepare_payment with MetaMask instead.",
  {
    to: z.string().describe("Recipient wallet address"),
    amount_eth: z.string().describe("Amount in ETH to send"),
    note: z.string().optional().describe("Optional payment note for logging"),
  },
  async ({ to, amount_eth, note }) => {
    try {
      const privateKey = process.env.SENDER_PRIVATE_KEY;
      if (!privateKey) {
        return {
          content: [
            {
              type: "text",
              text: "SENDER_PRIVATE_KEY not set. For production use prepare_payment with MetaMask.",
            },
          ],
          isError: true,
        };
      }

      if (!ethers.isAddress(to)) {
        return {
          content: [{ type: "text", text: `Error: ${to} is not a valid address.` }],
          isError: true,
        };
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      const value = ethers.parseEther(amount_eth);
      const tx = await wallet.sendTransaction({ to, value });
      await tx.wait(1); // Wait for 1 confirmation

      return {
        content: [
          {
            type: "text",
            text:
              `Payment sent!\n` +
              `Tx Hash: ${tx.hash}\n` +
              `To: ${to}\n` +
              `Amount: ${amount_eth} ETH` +
              (note ? `\nNote: ${note}` : ""),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// -----------------------------------------------------------
// TOOL 6: get_transaction_history
// Verify payments landed and audit gig payment history.
// -----------------------------------------------------------
server.tool(
  "get_transaction_history",
  "Get recent transactions for a wallet address. Use this to verify a payment landed.",
  {
    address: z.string().describe("Ethereum wallet address (0x...)"),
    limit: z
      .number()
      .optional()
      .describe("Number of transactions to return (default 5, max 20)"),
  },
  async ({ address, limit = 5 }) => {
    try {
      const cap = Math.min(limit, 20);
      const baseUrl = etherscanBase(NETWORK);
      const url =
        `${baseUrl}/api?module=account&action=txlist` +
        `&address=${address}&startblock=0&endblock=99999999` +
        `&page=1&offset=${cap}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

      const res = await fetch(url);
      const data = (await res.json()) as { status: string; message: string; result: any[] };

      if (data.status !== "1") {
        return {
          content: [{ type: "text", text: `No transactions found: ${data.message}` }],
        };
      }

      const txList = data.result
        .map(
          (tx: any) =>
            `Hash: ${tx.hash}\n` +
            `From: ${tx.from}\n` +
            `To: ${tx.to}\n` +
            `Value: ${ethers.formatEther(tx.value)} ETH\n` +
            `Status: ${tx.isError === "0" ? "Success" : "Failed"}`
        )
        .join("\n\n");

      return { content: [{ type: "text", text: txList }] };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// -----------------------------------------------------------
// START SERVER
// -----------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Wallet MCP Server running on stdio");
