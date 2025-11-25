'use client';

import { useCallback, useState } from 'react';

import type { SerializedTransaction } from '../components/transaction-row';

/**
 * CSV column configuration
 */
interface CsvColumn {
  header: string;
  getValue: (tx: SerializedTransaction) => string;
}

/**
 * CSV columns for export
 */
const CSV_COLUMNS: CsvColumn[] = [
  { header: 'Transaction ID', getValue: (tx) => tx.id },
  { header: 'Date', getValue: (tx) => tx.createdAt.split('T')[0] ?? '' },
  { header: 'Time', getValue: (tx) => tx.createdAt.split('T')[1]?.split('.')[0] ?? '' },
  { header: 'Merchant', getValue: (tx) => tx.merchant.name },
  { header: 'Category', getValue: (tx) => tx.merchant.category },
  { header: 'City', getValue: (tx) => tx.merchant.city ?? '' },
  { header: 'Country', getValue: (tx) => tx.merchant.country ?? '' },
  { header: 'Amount', getValue: (tx) => tx.billingAmount.amount.toFixed(2) },
  { header: 'Currency', getValue: (tx) => tx.billingAmount.currency },
  { header: 'Original Amount', getValue: (tx) => tx.transactionAmount.amount.toFixed(2) },
  { header: 'Original Currency', getValue: (tx) => tx.transactionAmount.currency },
  { header: 'Status', getValue: (tx) => tx.status },
  { header: 'Type', getValue: (tx) => tx.type },
  { header: 'Kind', getValue: (tx) => tx.kind },
  { header: 'Card (Last 4)', getValue: (tx) => tx.cardTokenLast4 },
  { header: 'Cashback Eligible', getValue: (tx) => tx.isEligibleForCashback ? 'Yes' : 'No' },
];

/**
 * Escape CSV value
 */
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV content
 */
function generateCsv(transactions: SerializedTransaction[]): string {
  const lines: string[] = [];

  // Headers
  lines.push(CSV_COLUMNS.map((col) => escapeCsvValue(col.header)).join(','));

  // Data rows
  for (const tx of transactions) {
    lines.push(CSV_COLUMNS.map((col) => escapeCsvValue(col.getValue(tx))).join(','));
  }

  return lines.join('\n');
}

/**
 * Generate filename with date
 */
function generateFilename(transactions: SerializedTransaction[]): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';

  if (transactions.length === 0) {
    return `transactions_${dateStr}.csv`;
  }

  // Get date range
  const dates = transactions.map((tx) => tx.createdAt).sort();
  const firstDate = dates[0]?.split('T')[0]?.replace(/-/g, '') ?? '';
  const lastDate = dates[dates.length - 1]?.split('T')[0]?.replace(/-/g, '') ?? '';

  return `transactions_${firstDate}_${lastDate}.csv`;
}

/**
 * Download file in browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Hook for exporting transactions
 */
export function useExportTransactions() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCsv = useCallback((transactions: SerializedTransaction[]) => {
    setIsExporting(true);

    try {
      const content = generateCsv(transactions);
      const filename = generateFilename(transactions);
      downloadFile(content, filename, 'text/csv');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportToCsv,
    isExporting,
  };
}

