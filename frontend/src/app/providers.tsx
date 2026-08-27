'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';
import Cookies from 'js-cookie';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      fetchUser().catch(() => {
        // error handling handled by store/api
      });
    }
  }, [fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
