import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@payments-view/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="text-center">
        <FileQuestion className="mx-auto mb-6 h-24 w-24 text-muted-foreground/50" />
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">Page Not Found</h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  );
}

