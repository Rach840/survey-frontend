'use client';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({children,state}: { children: React.ReactNode; state?: unknown }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60_000,
                        gcTime: 60 * 60_000,
                        refetchOnWindowFocus: false,
                        retry: 2,
                    },
                    mutations: { retry: 0 },
                },
            }),
    );

    return (
        <QueryClientProvider client={client}>
            <HydrationBoundary state={state}>{children}</HydrationBoundary>
        </QueryClientProvider>
    );
}
