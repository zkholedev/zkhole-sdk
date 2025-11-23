// Main exports
export { ZkHoleClient } from "./client";

// Type exports
export type {
  WalletAdapter,
  ZkHoleConfig,
  TransactionParams,
  TransactionStatus,
  Transaction,
  Confirmation,
  Balance,
} from "./types";

// Error exports
export {
  ZkHoleError,
  ValidationError,
  InsufficientFundsError,
  NetworkError,
  TransactionError,
  WalletError,
} from "./errors";
