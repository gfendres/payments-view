'use client';

import { useState, useCallback, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'gnosis_onboarding_completed';

/**
 * Onboarding step configuration
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight?: string; // CSS selector to highlight element
}

/**
 * Onboarding steps for new users
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gnosis Pay',
    description:
      'Your all-in-one dashboard for tracking card transactions, cashback rewards, and spending insights.',
    icon: '👋',
  },
  {
    id: 'transactions',
    title: 'Track Your Transactions',
    description:
      'View all your card transactions in one place. Filter by date, category, or amount to find what you need.',
    icon: '💳',
    highlight: '[href="/dashboard/transactions"]',
  },
  {
    id: 'rewards',
    title: 'Earn Cashback Rewards',
    description:
      'Every purchase earns you cashback! Hold more GNO to unlock higher reward tiers and maximize your earnings.',
    icon: '🎁',
    highlight: '[href="/dashboard/rewards"]',
  },
  {
    id: 'analytics',
    title: 'Spending Insights',
    description:
      'Understand your spending patterns with visual charts. See where your money goes by category and time.',
    icon: '📊',
    highlight: '[href="/dashboard/analytics"]',
  },
  {
    id: 'export',
    title: 'Export Your Data',
    description:
      'Download your transaction history as CSV or PDF. Perfect for accounting, taxes, or personal records.',
    icon: '📥',
  },
];

/**
 * Hook for managing onboarding state
 */
export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState(true); // Default to true to prevent flash
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      const hasCompleted = completed === 'true';
      setIsCompleted(hasCompleted);
      setIsOpen(!hasCompleted);
    }
  }, []);

  const totalSteps = ONBOARDING_STEPS.length;
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStep(index);
      }
    },
    [totalSteps]
  );

  const completeOnboarding = useCallback(() => {
    setIsCompleted(true);
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const restartOnboarding = useCallback(() => {
    setIsCompleted(false);
    setCurrentStep(0);
    setIsOpen(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  const openOnboarding = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    // State
    isCompleted,
    isOpen,
    currentStep,
    step,
    totalSteps,
    progress,
    isLastStep,
    isFirstStep,
    steps: ONBOARDING_STEPS,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding,
    openOnboarding,
    closeOnboarding,
  };
}

