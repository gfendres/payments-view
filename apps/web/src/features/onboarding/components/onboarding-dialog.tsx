'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
} from '@payments-view/ui';

import { useOnboarding, type OnboardingStep } from '../hooks/use-onboarding';

/**
 * Step indicator dots
 */
function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: OnboardingStep[];
  currentStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onStepClick(index)}
          className={`h-2 w-2 rounded-full transition-all ${
            index === currentStep
              ? 'w-6 bg-primary'
              : index < currentStep
                ? 'bg-primary/50'
                : 'bg-muted-foreground/30'
          }`}
          aria-label={`Go to step ${index + 1}: ${step.title}`}
        />
      ))}
    </div>
  );
}

/**
 * Single onboarding step content
 */
function StepContent({ step }: { step: OnboardingStep }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-6 text-6xl">{step.icon}</div>
      <h2 className="mb-3 text-2xl font-bold">{step.title}</h2>
      <p className="max-w-md text-muted-foreground">{step.description}</p>
    </div>
  );
}

/**
 * Onboarding dialog component
 */
export function OnboardingDialog() {
  const {
    isOpen,
    currentStep,
    step,
    totalSteps,
    progress,
    isLastStep,
    isFirstStep,
    steps,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    closeOnboarding,
  } = useOnboarding();

  // Highlight element when step changes
  useEffect(() => {
    if (!isOpen || !step?.highlight) return;

    const element = document.querySelector(step.highlight);
    if (element) {
      element.classList.add('onboarding-highlight');
      return () => {
        element.classList.remove('onboarding-highlight');
      };
    }
  }, [isOpen, step?.highlight]);

  if (!step) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeOnboarding()}>
      <DialogContent className="max-w-lg overflow-hidden p-0" aria-describedby={undefined}>
        {/* Accessibility: Visually hidden title for screen readers */}
        <DialogTitle className="sr-only">Welcome to Finance Dashboard</DialogTitle>
        <DialogDescription className="sr-only">
          An onboarding tour to help you get started with your Finance Dashboard
        </DialogDescription>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header with skip button */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <button
            type="button"
            onClick={skipOnboarding}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step content */}
        <div className="px-6">
          <StepContent step={step} />
        </div>

        {/* Step indicators */}
        <div className="px-6 pb-4">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button onClick={completeOnboarding} className="gap-2">
              Get Started
              <Sparkles className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

