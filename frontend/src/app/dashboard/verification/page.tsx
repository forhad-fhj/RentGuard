'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

export default function VerificationPage() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [nidNumber, setNidNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchStatus();
    }, [isAuthenticated]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/identity/status');
            setStatus(res.data);
        } catch { setStatus(null); }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            await api.post('/identity/verify', { 
                nidNumber, 
                fullName, 
                dateOfBirth,
                nidFrontImage: dummyImage,
                nidBackImage: dummyImage,
                selfieImage: dummyImage
            });
            await fetchStatus();
        } catch { alert('Verification submission failed. Please try again.'); }
        setSubmitting(false);
    };

    const statusConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
        PENDING: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', label: 'Pending Review', icon: '⏳' },
        APPROVED: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', label: 'Verified', icon: '✅' },
        REJECTED: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Rejected', icon: '❌' },
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">← Dashboard</Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-8">Identity Verification</h1>

                <div className="max-w-2xl">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading...</div>
                    ) : status ? (
                        <div className="space-y-6">
                            {/* Current Status */}
                            <div className={`rounded-xl border p-6 ${statusConfig[status.verificationStatus]?.bg || 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{statusConfig[status.verificationStatus]?.icon || '📋'}</span>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">Verification Status</h2>
                                        <p className={`text-sm font-medium ${statusConfig[status.verificationStatus]?.color || 'text-gray-600'}`}>
                                            {statusConfig[status.verificationStatus]?.label || status.verificationStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Verification Details</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Full Name</span>
                                        <span className="text-sm font-medium text-gray-900">{status.fullName || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">NID Number</span>
                                        <span className="text-sm font-medium text-gray-900">{'••••' + (status.nidNumber?.slice(-4) || '••••')}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Date of Birth</span>
                                        <span className="text-sm font-medium text-gray-900">{status.dateOfBirth || '-'}</span>
                                    </div>
                                    {status.faceMatchScore && (
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Face Match Score</span>
                                            <span className="text-sm font-medium text-gray-900">{(status.faceMatchScore * 100).toFixed(1)}%</span>
                                        </div>
                                    )}
                                    {status.livenessScore && (
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Liveness Score</span>
                                            <span className="text-sm font-medium text-gray-900">{(status.livenessScore * 100).toFixed(1)}%</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-sm text-gray-500">Submitted</span>
                                        <span className="text-sm font-medium text-gray-900">{new Date(status.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* New Verification Form */
                        <div className="space-y-6">
                            <div className="bg-primary-50 rounded-xl border border-primary-100 p-6">
                                <h2 className="font-semibold text-gray-900 mb-2">🪪 Why Verify?</h2>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>✓ Build trust with landlords</li>
                                    <li>✓ Access all platform features</li>
                                    <li>✓ One-time verification for all rentals</li>
                                    <li>✓ Your NID data is AES-256 encrypted</li>
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                <h2 className="font-semibold text-gray-900">Submit Verification</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as on NID) *</label>
                                    <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="মোহাম্মদ আব্দুল্লাহ / Mohammad Abdullah" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NID Number *</label>
                                    <input required type="text" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} placeholder="1234567890" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                    <input required type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                                    {submitting ? 'Submitting...' : 'Submit Verification'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
