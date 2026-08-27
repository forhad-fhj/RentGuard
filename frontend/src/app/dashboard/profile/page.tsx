'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, isAuthenticated, logout, fetchUser } = useAuthStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        profession: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && !isAuthenticated) {
            window.location.href = '/auth/login';
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (user) {
            const profile = user.role === 'TENANT' ? user.tenantProfile : user.landlordProfile;
            setFormData({
                fullName: profile?.fullName || '',
                phone: user.phone || '',
                address: profile?.address || '',
                profession: profile?.profession || ''
            });
        }
    }, [user]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.put('/auth/profile', formData);
            await fetchUser();
            setSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const profile = user.role === 'TENANT' ? user.tenantProfile : user.landlordProfile;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-white text-lg font-semibold">{profile?.fullName || user.email}</h2>
                                    <span className="inline-block mt-1 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            {!isEditing ? (
                                /* View Mode */
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Email</span>
                                        <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Full Name</span>
                                        <span className="text-sm font-medium text-gray-900">{profile?.fullName || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Phone</span>
                                        <span className="text-sm font-medium text-gray-900">{user.phone || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Address</span>
                                        <span className="text-sm font-medium text-gray-900">{profile?.address || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Profession</span>
                                        <span className="text-sm font-medium text-gray-900">{profile?.profession || 'Not set'}</span>
                                    </div>
                                </div>
                            ) : (
                                /* Edit Mode */
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Profession</label>
                                        <input
                                            type="text"
                                            name="profession"
                                            value={formData.profession}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-2.5 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Actions */}
                        {!isEditing && (
                            <div className="px-6 pb-6">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
