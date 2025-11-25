'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@payments-view/api';

/**
 * tRPC React client
 */
export const trpc = createTRPCReact<AppRouter>();

