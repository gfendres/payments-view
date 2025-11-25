'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@payments-view/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-6 h-24 w-24 text-destructive" />
        <h1 className="mb-2 text-4xl font-bold">Something went wrong</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">An unexpected error occurred</h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          We apologize for the inconvenience. Please try again or return to the home page.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <pre className="mx-auto mb-6 max-h-32 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs">
            {error.message}
            {error.digest && (
              <>
                {'\n'}
                Digest: {error.digest}
              </>
            )}
          </pre>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

