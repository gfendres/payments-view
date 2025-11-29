import { Result } from '@payments-view/domain/shared';
import type { Transaction } from '@payments-view/domain/transaction';

/**
 * Export format types
 */
export type ExportFormat = 'csv';

/**
 * Export options
 */
export interface ExportTransactionsInput {
  transactions: Transaction[];
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Export result
 */
export interface ExportTransactionsOutput {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * CSV column configuration
 */
interface CsvColumn {
  header: string;
  getValue: (tx: Transaction) => string;
}

/**
 * CSV column definitions for transaction export
 */
const CSV_COLUMNS: CsvColumn[] = [
  { header: 'Transaction ID', getValue: (tx) => tx.id },
  { header: 'Date', getValue: (tx) => tx.createdAt.toISOString().split('T')[0] ?? '' },
  { header: 'Time', getValue: (tx) => tx.createdAt.toISOString().split('T')[1]?.split('.')[0] ?? '' },
  { header: 'Merchant', getValue: (tx) => tx.merchant.name },
  { header: 'Category', getValue: (tx) => tx.category.name },
  { header: 'Amount', getValue: (tx) => tx.billingAmount.toNumber().toFixed(2) },
  { header: 'Currency', getValue: (tx) => tx.billingAmount.currency },
  { header: 'Original Amount', getValue: (tx) => tx.transactionAmount.toNumber().toFixed(2) },
  { header: 'Original Currency', getValue: (tx) => tx.transactionAmount.currency },
  { header: 'Status', getValue: (tx) => tx.status },
  { header: 'Type', getValue: (tx) => tx.type },
  { header: 'Kind', getValue: (tx) => tx.kind },
  { header: 'Card (Last 4)', getValue: (tx) => tx.cardTokenLast4 },
  { header: 'Cashback Eligible', getValue: (tx) => tx.isEligibleForCashback ? 'Yes' : 'No' },
  { header: 'MCC', getValue: (tx) => tx.merchant.mcc },
  { header: 'Cleared Date', getValue: (tx) => tx.clearedAt?.toISOString().split('T')[0] ?? '' },
];

/**
 * Escape CSV value to handle special characters
 */
function escapeCsvValue(value: string): string {
  const needsFormulaEscape = ['=', '+', '-', '@', '\t'].includes(value.charAt(0));
  const sanitized = needsFormulaEscape ? `'${value}` : value;

  // If value contains comma, newline, or double quote, wrap in quotes
  if (sanitized.includes(',') || sanitized.includes('\n') || sanitized.includes('"')) {
    // Escape double quotes by doubling them
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

/**
 * Generate CSV content from transactions
 */
function generateCsv(transactions: Transaction[], includeHeaders: boolean): string {
  const lines: string[] = [];

  // Add header row
  if (includeHeaders) {
    const headers = CSV_COLUMNS.map((col) => escapeCsvValue(col.header)).join(',');
    lines.push(headers);
  }

  // Add data rows
  for (const tx of transactions) {
    const values = CSV_COLUMNS.map((col) => escapeCsvValue(col.getValue(tx))).join(',');
    lines.push(values);
  }

  return lines.join('\n');
}

/**
 * Generate filename with date range
 */
function generateFilename(transactions: Transaction[], format: ExportFormat): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';

  if (transactions.length === 0) {
    return `transactions_export_${dateStr}.${format}`;
  }

  // Get date range from transactions
  const sortedDates = transactions
    .map((tx) => tx.createdAt)
    .sort((a, b) => a.getTime() - b.getTime());

  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];

  if (firstDate && lastDate) {
    const from = firstDate.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';
    const to = lastDate.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';
    return `transactions_${from}_${to}.${format}`;
  }

  return `transactions_export_${dateStr}.${format}`;
}

/**
 * Export Transactions Use Case
 * Generates exportable file content from transactions
 */
export class ExportTransactionsUseCase {
  /**
   * Execute the use case
   */
  execute(input: ExportTransactionsInput): Result<ExportTransactionsOutput, never> {
    const { transactions, format, filename, includeHeaders = true } = input;

    // Only CSV is currently supported; keep logic explicit for future formats
    const content = generateCsv(transactions, includeHeaders);
    const mimeType = 'text/csv';
    const finalFilename = filename ?? generateFilename(transactions, format);

    return Result.ok({
      content,
      filename: finalFilename,
      mimeType,
    });
  }
}
