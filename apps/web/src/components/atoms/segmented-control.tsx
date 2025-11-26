'use client';

import { type ReactNode } from 'react';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable segmented control component
 * Used for toggling between options like view modes, filters, time periods, etc.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <div className={`inline-flex rounded-xl bg-muted p-1 ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${sizeClasses[size]} ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

