'use client';

import {
  ShoppingCart,
  Utensils,
  Car,
  ShoppingBag,
  Plane,
  Film,
  HeartPulse,
  Lightbulb,
  Smartphone,
  Landmark,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryIconName } from '@payments-view/constants';

/**
 * Map icon names to Lucide components
 */
const ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'plane': Plane,
  'film': Film,
  'heart-pulse': HeartPulse,
  'lightbulb': Lightbulb,
  'smartphone': Smartphone,
  'landmark': Landmark,
  'package': Package,
};

interface CategoryIconProps {
  icon: CategoryIconName;
  className?: string;
  size?: number;
}

/**
 * Renders a Lucide icon based on the category icon name
 */
export function CategoryIcon({ icon, className, size = 20 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[icon] ?? Package;
  return <IconComponent className={className} size={size} />;
}

