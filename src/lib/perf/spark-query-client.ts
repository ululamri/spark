import { QueryClient } from '@tanstack/svelte-query';

export function createSparkQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 300_000,
        refetchOnWindowFocus: false,
        retry: (failureCount) => failureCount < 2
      },
      mutations: {
        retry: 0
      }
    }
  });
}

export const sparkQueryKeys = {
  socialFeed: ['social', 'feed'] as const,
  profileMe: ['profile', 'me'] as const,
  mediaAssets: ['media', 'assets'] as const
};
