/**
 * Application error codes for structured error handling
 */
export enum ErrorCode {
  // Authentication errors (1xxx)
  UNAUTHORIZED = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  INVALID_SIGNATURE = 'AUTH_1003',
  SESSION_NOT_FOUND = 'AUTH_1004',
  WALLET_NOT_CONNECTED = 'AUTH_1005',

  // Transaction errors (2xxx)
  TRANSACTION_NOT_FOUND = 'TXN_2001',
  TRANSACTION_INVALID = 'TXN_2002',
  TRANSACTION_FETCH_FAILED = 'TXN_2003',

  // Rewards errors (3xxx)
  REWARDS_FETCH_FAILED = 'RWD_3001',
  REWARDS_CALCULATION_FAILED = 'RWD_3002',

  // Validation errors (4xxx)
  VALIDATION_FAILED = 'VAL_4001',
  INVALID_INPUT = 'VAL_4002',
  MISSING_REQUIRED_FIELD = 'VAL_4003',

  // External service errors (5xxx)
  GNOSIS_API_ERROR = 'EXT_5001',
  OPENAI_API_ERROR = 'EXT_5002',
  NETWORK_ERROR = 'EXT_5003',
  RATE_LIMITED = 'EXT_5004',

  // Internal errors (9xxx)
  INTERNAL_ERROR = 'INT_9001',
  NOT_IMPLEMENTED = 'INT_9002',
}

/**
 * Error code to HTTP status code mapping
 */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_SIGNATURE]: 401,
  [ErrorCode.SESSION_NOT_FOUND]: 401,
  [ErrorCode.WALLET_NOT_CONNECTED]: 401,
  [ErrorCode.TRANSACTION_NOT_FOUND]: 404,
  [ErrorCode.TRANSACTION_INVALID]: 400,
  [ErrorCode.TRANSACTION_FETCH_FAILED]: 502,
  [ErrorCode.REWARDS_FETCH_FAILED]: 502,
  [ErrorCode.REWARDS_CALCULATION_FAILED]: 500,
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.GNOSIS_API_ERROR]: 502,
  [ErrorCode.OPENAI_API_ERROR]: 502,
  [ErrorCode.NETWORK_ERROR]: 503,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
};

