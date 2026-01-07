'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CATEGORIES, CategoryId } from '@payments-view/constants';
import { Button } from '@payments-view/ui';

import { CategoryIcon } from '@/components/atoms/category-icon';

interface CategorySelectorProps {
  selectedCategories: CategoryId[];
  onChange: (categories: CategoryId[]) => void;
}

/**
 * Category selector component with dropdown
 */
export function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Add defensive check for CATEGORIES
  const categories = CATEGORIES ? Object.values(CATEGORIES) : [];

  const toggleCategory = (categoryId: CategoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((c) => c !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const getSelectedLabel = () => {
    if (selectedCategories.length === 0) return 'All Categories';
    if (selectedCategories.length === 1) {
      const firstCategory = selectedCategories[0];
      return firstCategory ? CATEGORIES[firstCategory].name : 'All Categories';
    }
    return `${selectedCategories.length} categories`;
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          {selectedCategories.length === 1 && selectedCategories[0] ? <CategoryIcon icon={CATEGORIES[selectedCategories[0]].icon} size={16} /> : null}
          {getSelectedLabel()}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen ? <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="border-border bg-card absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border p-2 shadow-lg">
            <div className="max-h-64 overflow-y-auto">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <CategoryIcon icon={category.icon} size={18} />
                    </span>
                    <span className="flex-1 font-medium">{category.name}</span>
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <div className="border-border mt-2 border-t pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    onChange([]);
                    setIsOpen(false);
                  }}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </div>
        </> : null}
    </div>
  );
}

