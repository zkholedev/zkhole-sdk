import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ZkHoleConfig,
  TransactionParams,
  Transaction,
  Confirmation,
} from "./types";
import {
  ValidationError,
  InsufficientFundsError,
  NetworkError,
  TransactionError,
  WalletError,
} from "./errors";

/**
 * Main client for interacting with zkHole protocol
 */
export class ZkHoleClient {
  private connection: Connection;
  private wallet: any;
  private network: string;
  private timeout: number;

  constructor(config: ZkHoleConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    this.network = config.network;
    this.timeout = config.timeout || 30000;

    this.validateConfig();
  }

  /**
   * Validate client configuration
   */
  private validateConfig(): void {
    if (!this.connection) {
      throw new ValidationError("Connection is required");
    }
    if (!this.wallet) {
      throw new ValidationError("Wallet is required");
    }
    if (!["mainnet-beta", "devnet", "testnet"].includes(this.network)) {
      throw new ValidationError("Invalid network");
    }
  }

  /**
   * Validate transaction parameters
   */
  private validateTransactionParams(params: TransactionParams): void {
    if (!params.recipient) {
      throw new ValidationError("Recipient address is required");
    }
    if (params.amount <= 0) {
      throw new ValidationError("Amount must be greater than 0");
    }

    // Validate recipient address format
    try {
      new PublicKey(params.recipient);
    } catch {
      throw new ValidationError("Invalid recipient address");
    }
  }

  /**
   * Send an anonymous transaction through zkHole protocol
   */
  async sendAnonymous(params: TransactionParams): Promise<Transaction> {
    this.validateTransactionParams(params);

    try {
      // Get wallet public key
      const fromPubkey = new PublicKey(this.wallet.publicKey.toString());
      const toPubkey = new PublicKey(params.recipient);

      // Check balance
      const balance = await this.connection.getBalance(fromPubkey);
      const amountLamports = params.amount * LAMPORTS_PER_SOL;

      if (balance < amountLamports) {
        throw new InsufficientFundsError(
          `Insufficient funds. Required: ${params.amount} SOL, Available: ${
            balance / LAMPORTS_PER_SOL
          } SOL`
        );
      }

      // Create transaction
      const transaction = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amountLamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign and send transaction
      if (!this.wallet.signTransaction) {
        throw new WalletError("Wallet does not support transaction signing");
      }

      const signed = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signed.serialize()
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, "confirmed");

      return {
        signature,
        status: "confirmed",
        timestamp: Date.now(),
        amount: params.amount,
        recipient: params.recipient,
      };
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof InsufficientFundsError ||
        error instanceof WalletError
      ) {
        throw error;
      }

      if (error.message?.includes("network")) {
        throw new NetworkError(`Network error: ${error.message}`);
      }

      throw new TransactionError(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Confirm a transaction by signature
   */
  async confirmTransaction(signature: string): Promise<Confirmation> {
    try {
      const confirmation = await this.connection.confirmTransaction(
        signature,
        "confirmed"
      );

      const status = await this.connection.getSignatureStatus(signature);

      return {
        signature,
        confirmed: !confirmation.value.err,
        slot: status.context.slot,
        error: confirmation.value.err
          ? String(confirmation.value.err)
          : undefined,
      };
    } catch (error: any) {
      throw new NetworkError(`Failed to confirm transaction: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<number> {
    try {
      const pubkey = new PublicKey(address);
      const lamports = await this.connection.getBalance(pubkey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (error: any) {
      throw new NetworkError(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 10): Promise<Transaction[]> {
    try {
      const pubkey = new PublicKey(this.wallet.publicKey.toString());
      const signatures = await this.connection.getSignaturesForAddress(pubkey, {
        limit,
      });

      return signatures.map((sig) => ({
        signature: sig.signature,
        status: sig.err ? "failed" : "confirmed",
        timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
      }));
    } catch (error: any) {
      throw new NetworkError(
        `Failed to get transaction history: ${error.message}`
      );
    }
  }

  /**
   * Get current network
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Get wallet public key
   */
  getWalletAddress(): string {
    return this.wallet.publicKey.toString();
  }
}
