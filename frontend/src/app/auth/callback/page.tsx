'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token);
      fetchUser().then(() => {
        router.push('/dashboard');
      }).catch(() => {
        router.push('/auth/login?error=GoogleAuthFailed');
      });
    } else {
      router.push('/auth/login?error=NoTokenProvided');
    }
  }, [searchParams, router, setToken, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Authenticating with Google...</p>
      </div>
    </div>
  );
}
