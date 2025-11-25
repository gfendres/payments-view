'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent } from '@payments-view/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <pre className="mb-4 max-h-32 overflow-auto rounded-lg bg-muted p-3 text-left text-xs">
                    {this.state.error.message}
                  </pre>
                )}
                <Button onClick={this.handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

