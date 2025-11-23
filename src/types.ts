import { Connection } from "@solana/web3.js";

/**
 * Wallet adapter interface compatible with Solana wallet standards
 */
export interface WalletAdapter {
  publicKey: {
    toString(): string;
  };
  signTransaction?: (transaction: any) => Promise<any>;
  signAllTransactions?: (transactions: any[]) => Promise<any[]>;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
}

/**
 * Configuration for ZkHoleClient
 */
export interface ZkHoleConfig {
  connection: Connection;
  wallet: WalletAdapter;
  network: "mainnet-beta" | "devnet" | "testnet";
  timeout?: number;
}

/**
 * Parameters for sending anonymous transactions
 */
export interface TransactionParams {
  recipient: string;
  amount: number;
  memo?: string;
}

/**
 * Transaction status types
 */
export type TransactionStatus = "pending" | "confirmed" | "failed";

/**
 * Transaction object returned from operations
 */
export interface Transaction {
  signature: string;
  status: TransactionStatus;
  timestamp: number;
  amount?: number;
  recipient?: string;
}

/**
 * Transaction confirmation details
 */
export interface Confirmation {
  signature: string;
  confirmed: boolean;
  slot?: number;
  blockTime?: number;
  error?: string;
}

/**
 * Balance information
 */
export interface Balance {
  address: string;
  lamports: number;
  sol: number;
}
