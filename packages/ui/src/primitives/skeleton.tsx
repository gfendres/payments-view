import * as React from 'react';

import { cn } from '../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  );
}

function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
}

function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />;
}

export { Skeleton, SkeletonText, SkeletonCircle };

