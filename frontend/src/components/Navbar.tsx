'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
              <Link href="/" className="text-gray-600 hover:text-primary-600 transition text-sm font-medium">
                Home
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
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Mobile logged-in */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/dashboard" className="text-sm text-gray-600 px-2 py-1">Dashboard</Link>
              <Link href="/dashboard/profile" className="text-sm text-gray-600 px-2 py-1">Profile</Link>
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
              <Link href="/auth/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                Sign In
              </Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <Link href="/auth/login" className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                Sign In
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
