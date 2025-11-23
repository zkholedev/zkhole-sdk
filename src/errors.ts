/**
 * Base error class for zkHole SDK
 */
export class ZkHoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZkHoleError";
  }
}

/**
 * Thrown when transaction parameters are invalid
 */
export class ValidationError extends ZkHoleError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Thrown when wallet has insufficient funds
 */
export class InsufficientFundsError extends ZkHoleError {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

/**
 * Thrown when network operations fail
 */
export class NetworkError extends ZkHoleError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Thrown when transaction fails
 */
export class TransactionError extends ZkHoleError {
  constructor(message: string) {
    super(message);
    this.name = "TransactionError";
  }
}

/**
 * Thrown when wallet operations fail
 */
export class WalletError extends ZkHoleError {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}
