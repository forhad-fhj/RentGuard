'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="text-xl text-primary-600">RentGuard</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
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
      </nav>
    </header>
  );
}
