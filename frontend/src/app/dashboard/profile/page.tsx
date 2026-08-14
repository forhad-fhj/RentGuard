'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);

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

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-2xl">
                    <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-white text-lg font-semibold mt-3">{user.email}</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                {user.role}
                            </span>
                        </div>

                        {/* Profile Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="text-sm font-medium text-gray-900">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Phone</span>
                                <span className="text-sm font-medium text-gray-900">{user.phone || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Role</span>
                                <span className="text-sm font-medium text-gray-900">{user.role}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">User ID</span>
                                <span className="text-sm font-mono text-gray-500">{user.id}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
