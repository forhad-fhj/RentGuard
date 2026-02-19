'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {user.email}. You are signed in as {user.role}.</p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <Link href="/auth/login" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition">
            <span className="font-medium text-gray-900">Profile</span>
            <p className="text-sm text-gray-500 mt-1">View and edit your profile</p>
          </Link>
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition"
          >
            <span className="font-medium text-gray-900">API Docs</span>
            <p className="text-sm text-gray-500 mt-1">Open API documentation (backend must be running)</p>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
