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

  const tenantActions = [
    { icon: '🏠', title: 'Browse Properties', desc: 'Find your next home', href: '/dashboard/properties' },
    { icon: '📊', title: 'Credit Score', desc: 'View your tenant score', href: '/dashboard/credit-score' },
    { icon: '📋', title: 'My Leases', desc: 'Manage rental agreements', href: '/dashboard/leases' },
    { icon: '🪪', title: 'Verify Identity', desc: 'NID verification for trust', href: '/dashboard/verification' },
    { icon: '💳', title: 'Payments', desc: 'View payment history', href: '/dashboard/payments' },
    { icon: '⚖️', title: 'Disputes', desc: 'Raise or view disputes', href: '/dashboard/disputes' },
  ];

  const landlordActions = [
    { icon: '🏠', title: 'My Properties', desc: 'Manage your listings', href: '/dashboard/properties' },
    { icon: '➕', title: 'List Property', desc: 'Add a new listing', href: '/dashboard/properties/create' },
    { icon: '📋', title: 'Lease Agreements', desc: 'View and manage leases', href: '/dashboard/leases' },
    { icon: '💳', title: 'Payments', desc: 'Track rent payments', href: '/dashboard/payments' },
    { icon: '⚖️', title: 'Disputes', desc: 'Resolve tenant issues', href: '/dashboard/disputes' },
    { icon: '🪪', title: 'Verify Identity', desc: 'Complete your KYC', href: '/dashboard/verification' },
  ];

  const actions = user.role === 'TENANT' ? tenantActions : landlordActions;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl px-8 py-10 mb-8 text-white">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-primary-100 mt-1">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-xs font-semibold rounded-full uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile & Actions Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5 text-lg">Profile Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account Type</p>
                  <p className="text-sm font-medium text-gray-900">{user.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">User ID</p>
                  <p className="text-xs font-mono text-gray-400 break-all">{user.id}</p>
                </div>
              </div>

              {/* Account Status */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">KYC Status</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5 text-lg">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {actions.map((a, i) => (
                  <Link key={i} href={a.href} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border border-gray-100 transition text-left">
                    <span className="text-2xl w-10 flex justify-center">{a.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                  </Link>
                ))}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link href="/dashboard/admin" className="flex items-center gap-4 p-4 rounded-xl bg-red-50 hover:bg-red-100 hover:border-red-200 border border-red-100 transition text-left sm:col-span-2">
                    <span className="text-2xl w-10 flex justify-center">🛡️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Admin Dashboard</p>
                      <p className="text-xs text-gray-500 mt-0.5">Platform stats & user management</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
