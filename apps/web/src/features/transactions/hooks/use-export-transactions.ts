'use client';

import { useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { buildCsvExport } from '../lib/transaction-use-cases';
import type { SerializedTransaction } from '../components/transaction-row';

/**
 * PDF columns (subset for cleaner layout)
 */
const PDF_COLUMNS = [
  { header: 'Date', getValue: (tx: SerializedTransaction) => tx.createdAt.split('T')[0] ?? '' },
  { header: 'Merchant', getValue: (tx: SerializedTransaction) => tx.merchant.name },
  { header: 'Category', getValue: (tx: SerializedTransaction) => tx.merchant.category },
  { header: 'Amount', getValue: (tx: SerializedTransaction) => tx.billingAmount.formatted },
  { header: 'Status', getValue: (tx: SerializedTransaction) => tx.status },
];

/**
 * Get date range from transactions
 */
function getDateRange(transactions: SerializedTransaction[]): { first: string; last: string } {
  if (transactions.length === 0) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';
    return { first: dateStr, last: dateStr };
  }

  const dates = transactions.map((tx) => tx.createdAt).sort();
  return {
    first: dates[0]?.split('T')[0]?.replace(/-/g, '') ?? '',
    last: dates[dates.length - 1]?.split('T')[0]?.replace(/-/g, '') ?? '',
  };
}

/**
 * Generate filename with date
 */
function generateFilename(transactions: SerializedTransaction[], extension: string): string {
  const { first, last } = getDateRange(transactions);
  return `transactions_${first}_${last}.${extension}`;
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
 * Calculate summary statistics
 */
function calculateSummary(transactions: SerializedTransaction[]) {
  let totalSpending = 0;
  let totalRefunds = 0;
  let eligibleCount = 0;

  for (const tx of transactions) {
    const amount = Math.abs(tx.billingAmount.amount);
    if (tx.billingAmount.amount < 0 || tx.kind === 'Payment') {
      totalSpending += amount;
    } else {
      totalRefunds += amount;
    }
    if (tx.isEligibleForCashback) {
      eligibleCount++;
    }
  }

  return {
    totalTransactions: transactions.length,
    totalSpending,
    totalRefunds,
    netSpending: totalSpending - totalRefunds,
    eligibleCount,
  };
}

/**
 * Generate PDF document
 */
function generatePdf(transactions: SerializedTransaction[]): jsPDF {
  const doc = new jsPDF();
  const { first, last } = getDateRange(transactions);
  const summary = calculateSummary(transactions);

  // Format dates for display
  const formatDisplayDate = (dateStr: string) => {
    if (dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald color
  doc.text('Gnosis Pay Transactions', 14, 22);

  // Subtitle with date range
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Period: ${formatDisplayDate(first)} to ${formatDisplayDate(last)}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

  // Summary section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const summaryY = 54;
  doc.text(`Total Transactions: ${summary.totalTransactions}`, 14, summaryY);
  doc.text(`Total Spending: €${summary.totalSpending.toFixed(2)}`, 14, summaryY + 6);
  doc.text(`Total Refunds: €${summary.totalRefunds.toFixed(2)}`, 14, summaryY + 12);
  doc.text(`Net Spending: €${summary.netSpending.toFixed(2)}`, 14, summaryY + 18);
  doc.text(`Cashback Eligible: ${summary.eligibleCount}`, 14, summaryY + 24);

  // Transactions table
  const tableData = transactions.map((tx) =>
    PDF_COLUMNS.map((col) => col.getValue(tx))
  );

  autoTable(doc, {
    head: [PDF_COLUMNS.map((col) => col.header)],
    body: tableData,
    startY: summaryY + 34,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [16, 185, 129], // Emerald
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 50 }, // Merchant
      2: { cellWidth: 35 }, // Category
      3: { cellWidth: 30 }, // Amount
      4: { cellWidth: 25 }, // Status
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'Gnosis Pay - Transaction Report',
      14,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
}

/**
 * Hook for exporting transactions
 */
export function useExportTransactions() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCsv = useCallback((transactions: SerializedTransaction[]) => {
    setIsExporting(true);

    try {
      const exportResult = buildCsvExport(transactions);
      if (!exportResult) {
        throw new Error('Failed to generate CSV export');
      }

      downloadFile(exportResult.content, exportResult.filename, exportResult.mimeType);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToPdf = useCallback((transactions: SerializedTransaction[]) => {
    setIsExporting(true);

    try {
      const doc = generatePdf(transactions);
      const filename = generateFilename(transactions, 'pdf');
      doc.save(filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportToCsv,
    exportToPdf,
    isExporting,
  };
}
