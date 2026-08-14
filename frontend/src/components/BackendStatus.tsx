'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function BackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use health check endpoint
        await api.get('/health', { timeout: 2000 });
        setIsOnline(true);
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
          setIsOnline(false);
        } else {
          // Backend responded (even with error), so it's online
          setIsOnline(true);
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) return null;

  if (!isOnline) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Backend server is not running.</strong> Start it with:{' '}
              <code className="bg-yellow-100 px-2 py-1 rounded">cd backend && npm run start:dev</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
