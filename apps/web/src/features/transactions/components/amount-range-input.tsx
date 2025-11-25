'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@payments-view/ui';

/**
 * Amount range value
 */
export interface AmountRange {
  min?: number;
  max?: number;
}

interface AmountRangeInputProps {
  value: AmountRange;
  onChange: (range: AmountRange) => void;
  currency?: string;
}

/**
 * Parse amount string to number, handling currency symbols
 */
function parseAmount(value: string): number | undefined {
  if (!value.trim()) return undefined;
  // Remove currency symbols and spaces, handle comma as decimal separator
  const cleaned = value.replace(/[€$£¥\s]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Format number as currency display
 */
function formatAmount(value: number | undefined): string {
  if (value === undefined) return '';
  return value.toFixed(2);
}

/**
 * Amount range input component for filtering transactions by amount
 */
export function AmountRangeInput({ value, onChange, currency = '€' }: AmountRangeInputProps) {
  const [minInput, setMinInput] = useState(formatAmount(value.min));
  const [maxInput, setMaxInput] = useState(formatAmount(value.max));

  // Sync with external value changes
  useEffect(() => {
    setMinInput(formatAmount(value.min));
    setMaxInput(formatAmount(value.max));
  }, [value.min, value.max]);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMinInput(inputValue);
    },
    []
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMaxInput(inputValue);
    },
    []
  );

  const handleMinBlur = useCallback(() => {
    const parsed = parseAmount(minInput);
    onChange({ ...value, min: parsed });
    setMinInput(formatAmount(parsed));
  }, [minInput, value, onChange]);

  const handleMaxBlur = useCallback(() => {
    const parsed = parseAmount(maxInput);
    onChange({ ...value, max: parsed });
    setMaxInput(formatAmount(parsed));
  }, [maxInput, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, field: 'min' | 'max') => {
      if (e.key === 'Enter') {
        if (field === 'min') {
          handleMinBlur();
        } else {
          handleMaxBlur();
        }
      }
    },
    [handleMinBlur, handleMaxBlur]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currency}
        </span>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Min"
          value={minInput}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          onKeyDown={(e) => handleKeyDown(e, 'min')}
          className="pl-7"
        />
      </div>
      <span className="text-muted-foreground">-</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currency}
        </span>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Max"
          value={maxInput}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          onKeyDown={(e) => handleKeyDown(e, 'max')}
          className="pl-7"
        />
      </div>
    </div>
  );
}

