import type { EthereumAddress } from '../../transaction/value-objects/ethereum-address';

/**
 * Wallet entity props
 */
export interface WalletProps {
  address: EthereumAddress;
  chainId: number;
  isConnected: boolean;
}

/**
 * Wallet entity - represents a connected wallet
 */
export class Wallet {
  private readonly _address: EthereumAddress;
  private readonly _chainId: number;
  private _isConnected: boolean;

  private constructor(props: WalletProps) {
    this._address = props.address;
    this._chainId = props.chainId;
    this._isConnected = props.isConnected;
  }

  /**
   * Create a Wallet entity
   */
  static create(props: WalletProps): Wallet {
    return new Wallet(props);
  }

  get address(): EthereumAddress {
    return this._address;
  }

  get chainId(): number {
    return this._chainId;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Check if wallet is on Gnosis Chain
   */
  get isGnosisChain(): boolean {
    return this._chainId === 100;
  }

  /**
   * Disconnect the wallet
   */
  disconnect(): void {
    this._isConnected = false;
  }
}
