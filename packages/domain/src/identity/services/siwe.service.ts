import { AUTH_CONFIG } from '@payments-view/constants';

/**
 * SIWE message parameters
 */
export interface SiweMessageParams {
  address: string;
  nonce: string;
  chainId?: number;
  domain?: string;
  uri?: string;
  statement?: string;
  issuedAt?: Date;
  expirationTime?: Date;
}

/**
 * SIWE message fields
 */
export interface SiweMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string | undefined;
}

/**
 * SIWE Service - generates Sign-In with Ethereum messages
 * Pure domain service with no external dependencies
 */
export class SiweService {
  /**
   * Create a SIWE message from parameters
   */
  createMessage(params: SiweMessageParams): SiweMessage {
    const now = params.issuedAt ?? new Date();
    const chainId = params.chainId ?? AUTH_CONFIG.CHAIN_ID;

    return {
      domain: params.domain ?? AUTH_CONFIG.SIWE_DOMAIN,
      address: params.address,
      statement: params.statement ?? AUTH_CONFIG.SIWE_STATEMENT,
      uri: params.uri ?? AUTH_CONFIG.SIWE_URI,
      version: AUTH_CONFIG.SIWE_VERSION,
      chainId,
      nonce: params.nonce,
      issuedAt: now.toISOString(),
      expirationTime: params.expirationTime?.toISOString(),
    };
  }

  /**
   * Format SIWE message as string for signing
   * Follows EIP-4361 specification
   */
  formatMessage(message: SiweMessage): string {
    const lines: string[] = [
      `${message.domain} wants you to sign in with your Ethereum account:`,
      message.address,
      '',
      message.statement,
      '',
      `URI: ${message.uri}`,
      `Version: ${message.version}`,
      `Chain ID: ${message.chainId}`,
      `Nonce: ${message.nonce}`,
      `Issued At: ${message.issuedAt}`,
    ];

    if (message.expirationTime) {
      lines.push(`Expiration Time: ${message.expirationTime}`);
    }

    return lines.join('\n');
  }

  /**
   * Create and format a SIWE message in one step
   */
  createFormattedMessage(params: SiweMessageParams): string {
    const message = this.createMessage(params);
    return this.formatMessage(message);
  }
}

