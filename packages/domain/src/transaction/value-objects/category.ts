import {
  type CategoryId,
  type CategoryConfig,
  getCategoryConfig,
  getCategoryFromMcc,
} from '@payments-view/constants';

/**
 * Category value object - represents a transaction category
 */
export class Category {
  private constructor(
    private readonly _id: CategoryId,
    private readonly _config: CategoryConfig
  ) {}

  /**
   * Create a Category from a CategoryId
   */
  static fromId(id: CategoryId): Category {
    const config = getCategoryConfig(id);
    return new Category(id, config);
  }

  /**
   * Create a Category from an MCC code
   */
  static fromMcc(mcc: string): Category {
    const id = getCategoryFromMcc(mcc);
    return Category.fromId(id);
  }

  /**
   * Get the category ID
   */
  get id(): CategoryId {
    return this._id;
  }

  /**
   * Get the display name
   */
  get name(): string {
    return this._config.name;
  }

  /**
   * Get the icon emoji
   */
  get icon(): string {
    return this._config.icon;
  }

  /**
   * Get the color
   */
  get color(): string {
    return this._config.color;
  }

  /**
   * Check equality
   */
  equals(other: Category): boolean {
    return this._id === other._id;
  }
}

