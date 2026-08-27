'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="text-xl text-primary-600">RentGuard</span>
        </Link>

        {isAuthenticated && user ? (
          <>
            {/* Logged-in nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/properties" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Browse
              </Link>
              {user.role === 'LANDLORD' && (
                <Link href="/landlord/properties" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                  My Listings
                </Link>
              )}
              {user.role === 'TENANT' && (
                <Link href="/tenant/applications" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                  Applications
                </Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link href="/admin/review-queue" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                  Review Queue
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-medium hover:text-red-700 transition"
              >
                Sign Out
              </button>
            </div>
            {/* Mobile logged-in */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/dashboard" className="text-sm text-gray-600 px-2 py-1">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-medium px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Logged-out nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Browse Listings
              </Link>
              <Link href="/#how-it-works" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                How It Works
              </Link>
              <Link href="/#features" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Features
              </Link>
              <Link href="/#trust" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Trust & Security
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <Link href="/auth/login" className="text-sm text-gray-600 px-3 py-2">Sign In</Link>
              <Link href="/auth/register" className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                Get Started
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
