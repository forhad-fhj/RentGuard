'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

interface Lease {
    id: string;
    leaseNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    tenantSignature: string | null;
    landlordSignature: string | null;
    property?: { title: string; address: string };
    createdAt: string;
}

export default function LeasesPage() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [leases, setLeases] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchLeases();
    }, [isAuthenticated]);

    const fetchLeases = async () => {
        try {
            const res = await api.get('/leases');
            setLeases(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch { setLeases([]); }
        setLoading(false);
    };

    const handleSign = async (leaseId: string) => {
        setSigning(leaseId);
        try {
            await api.post(`/leases/${leaseId}/sign`, { signature: `${user?.email}-${Date.now()}` });
            await fetchLeases();
        } catch { alert('Failed to sign lease.'); }
        setSigning(null);
    };

    const statusStyles: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-600',
        PENDING_SIGNATURE: 'bg-yellow-50 text-yellow-700',
        ACTIVE: 'bg-green-50 text-green-700',
        TERMINATED: 'bg-red-50 text-red-700',
        EXPIRED: 'bg-gray-100 text-gray-500',
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">← Dashboard</Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-8">My Leases</h1>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : leases.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">📋</span>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Leases Yet</h2>
                        <p className="text-sm text-gray-500 mb-6">Apply for a property to get started with a digital lease</p>
                        <Link href="/dashboard/properties" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                            Browse Properties →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leases.map((lease) => (
                            <div key={lease.id} className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{lease.property?.title || 'Property'}</h3>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusStyles[lease.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {lease.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-3">{lease.property?.address || ''}</p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400 text-xs">Lease #</span>
                                                <p className="font-mono text-gray-600 text-xs">{lease.leaseNumber}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-xs">Rent</span>
                                                <p className="font-medium text-gray-900">৳{lease.monthlyRent?.toLocaleString()}/mo</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-xs">Period</span>
                                                <p className="text-gray-600 text-xs">{new Date(lease.startDate).toLocaleDateString()} — {new Date(lease.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${lease.tenantSignature ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-xs text-gray-500">Tenant {lease.tenantSignature ? 'Signed' : 'Pending'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${lease.landlordSignature ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-xs text-gray-500">Landlord {lease.landlordSignature ? 'Signed' : 'Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {lease.status === 'PENDING_SIGNATURE' && (
                                        <button onClick={() => handleSign(lease.id)} disabled={signing === lease.id}
                                            className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shrink-0 disabled:opacity-50">
                                            {signing === lease.id ? 'Signing...' : '✍️ Sign Lease'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
