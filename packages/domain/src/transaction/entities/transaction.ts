import {
  type TransactionKind,
  type TransactionStatus,
  type TransactionType,
  type CurrencyCode,
  isSuccessStatus,
} from '@payments-view/constants';

import { Money } from '../value-objects/money';
import { Category } from '../value-objects/category';
import { Merchant } from './merchant';

/**
 * Transaction entity props
 */
export interface TransactionProps {
  id: string;
  threadId: string;
  kind: TransactionKind;
  status: TransactionStatus;
  type: TransactionType;
  billingAmount: Money;
  transactionAmount: Money;
  merchant: Merchant;
  cardTokenLast4: string;
  isPending: boolean;
  isEligibleForCashback: boolean;
  createdAt: Date;
  clearedAt?: Date | undefined;
  onChainTxHash?: string | undefined;
}

/**
 * Transaction entity - represents a card transaction
 */
export class Transaction {
  private readonly _id: string;
  private readonly _threadId: string;
  private readonly _kind: TransactionKind;
  private readonly _status: TransactionStatus;
  private readonly _type: TransactionType;
  private readonly _billingAmount: Money;
  private readonly _transactionAmount: Money;
  private readonly _merchant: Merchant;
  private readonly _cardTokenLast4: string;
  private readonly _isPending: boolean;
  private readonly _isEligibleForCashback: boolean;
  private readonly _createdAt: Date;
  private readonly _clearedAt: Date | undefined;
  private readonly _onChainTxHash: string | undefined;

  private constructor(props: TransactionProps) {
    this._id = props.id;
    this._threadId = props.threadId;
    this._kind = props.kind;
    this._status = props.status;
    this._type = props.type;
    this._billingAmount = props.billingAmount;
    this._transactionAmount = props.transactionAmount;
    this._merchant = props.merchant;
    this._cardTokenLast4 = props.cardTokenLast4;
    this._isPending = props.isPending;
    this._isEligibleForCashback = props.isEligibleForCashback;
    this._createdAt = props.createdAt;
    this._clearedAt = props.clearedAt;
    this._onChainTxHash = props.onChainTxHash;
  }

  /**
   * Create a Transaction entity
   */
  static create(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get id(): string {
    return this._id;
  }

  get threadId(): string {
    return this._threadId;
  }

  get kind(): TransactionKind {
    return this._kind;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get type(): TransactionType {
    return this._type;
  }

  get billingAmount(): Money {
    return this._billingAmount;
  }

  get transactionAmount(): Money {
    return this._transactionAmount;
  }

  get merchant(): Merchant {
    return this._merchant;
  }

  get category(): Category {
    return this._merchant.category;
  }

  get cardTokenLast4(): string {
    return this._cardTokenLast4;
  }

  get isPending(): boolean {
    return this._isPending;
  }

  get isEligibleForCashback(): boolean {
    return this._isEligibleForCashback;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get clearedAt(): Date | undefined {
    return this._clearedAt;
  }

  get onChainTxHash(): string | undefined {
    return this._onChainTxHash;
  }

  /**
   * Check if transaction was successful
   */
  get isSuccessful(): boolean {
    return isSuccessStatus(this._status);
  }

  /**
   * Check if transaction involved currency conversion
   */
  get hasConversion(): boolean {
    return this._billingAmount.currency !== this._transactionAmount.currency;
  }

  /**
   * Get the billing currency
   */
  get billingCurrency(): CurrencyCode {
    return this._billingAmount.currency;
  }

  /**
   * Get the transaction currency
   */
  get transactionCurrency(): CurrencyCode {
    return this._transactionAmount.currency;
  }
}

