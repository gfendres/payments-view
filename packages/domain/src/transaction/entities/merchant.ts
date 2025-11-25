import { Category } from '../value-objects/category';

/**
 * Merchant entity - represents a merchant in a transaction
 */
export interface MerchantProps {
  name: string;
  city?: string | undefined;
  country?: string | undefined;
  mcc: string;
}

export class Merchant {
  private readonly _name: string;
  private readonly _city: string | undefined;
  private readonly _country: string | undefined;
  private readonly _mcc: string;
  private readonly _category: Category;

  private constructor(props: MerchantProps) {
    this._name = props.name;
    this._city = props.city;
    this._country = props.country;
    this._mcc = props.mcc;
    this._category = Category.fromMcc(props.mcc);
  }

  /**
   * Create a Merchant entity
   */
  static create(props: MerchantProps): Merchant {
    return new Merchant(props);
  }

  get name(): string {
    return this._name;
  }

  get city(): string | undefined {
    return this._city;
  }

  get country(): string | undefined {
    return this._country;
  }

  get mcc(): string {
    return this._mcc;
  }

  get category(): Category {
    return this._category;
  }

  /**
   * Get formatted location string
   */
  get location(): string | undefined {
    if (this._city && this._country) {
      return `${this._city}, ${this._country}`;
    }
    return this._city ?? this._country;
  }
}

