'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

interface Payment {
    id: string;
    amount: number;
    paymentType: string;
    paymentMethod: string;
    status: string;
    transactionId: string | null;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
}

interface Lease {
    id: string;
    leaseNumber: string;
    property?: { title: string };
    monthlyRent: number;
}

export default function PaymentsPage() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [leases, setLeases] = useState<Lease[]>([]);
    const [selectedLease, setSelectedLease] = useState('');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [payForm, setPayForm] = useState({ paymentMethod: 'BKASH', amount: '' });

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchLeases();
    }, [isAuthenticated]);

    const fetchLeases = async () => {
        try {
            const res = await api.get('/leases');
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setLeases(data.filter((l: any) => l.status === 'ACTIVE'));
            if (data.length > 0) { setSelectedLease(data[0].id); fetchPayments(data[0].id); }
        } catch { setLeases([]); }
        setLoading(false);
    };

    const fetchPayments = async (leaseId: string) => {
        try {
            const res = await api.get(`/payments/lease/${leaseId}`);
            setPayments(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch { setPayments([]); }
    };

    const handleLeaseChange = (id: string) => {
        setSelectedLease(id);
        fetchPayments(id);
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLease) return;
        setPaying(true);
        try {
            await api.post('/payments', {
                leaseId: selectedLease,
                amount: Number(payForm.amount),
                paymentType: 'RENT',
                paymentMethod: payForm.paymentMethod,
                dueDate: new Date().toISOString(),
            });
            await fetchPayments(selectedLease);
            setPayForm({ ...payForm, amount: '' });
        } catch { alert('Payment failed.'); }
        setPaying(false);
    };

    const statusStyles: Record<string, string> = {
        PENDING: 'bg-yellow-50 text-yellow-700',
        COMPLETED: 'bg-green-50 text-green-700',
        FAILED: 'bg-red-50 text-red-700',
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">← Dashboard</Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-8">Payments</h1>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : leases.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">💳</span>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Active Leases</h2>
                        <p className="text-sm text-gray-500">You need an active lease to make payments</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Make Payment */}
                        <div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
                                <h2 className="font-semibold text-gray-900 mb-4">Make Payment</h2>
                                <form onSubmit={handlePay} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Lease</label>
                                        <select value={selectedLease} onChange={(e) => handleLeaseChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                                            {leases.map(l => (
                                                <option key={l.id} value={l.id}>{l.property?.title || l.leaseNumber}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount (৳)</label>
                                        <input required type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder={leases.find(l => l.id === selectedLease)?.monthlyRent?.toString()} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
                                        <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                                            <option value="BKASH">bKash</option>
                                            <option value="NAGAD">Nagad</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={paying} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 text-sm">
                                        {paying ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900">Payment History</h2>
                                </div>
                                {payments.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 text-sm">No payments recorded for this lease</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-xs text-gray-500 border-b border-gray-100">
                                                    <th className="text-left py-3 px-4 font-medium">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                                                    <th className="text-left py-3 px-4 font-medium">Method</th>
                                                    <th className="text-left py-3 px-4 font-medium">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium">Txn ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((p) => (
                                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">৳{p.amount?.toLocaleString()}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">{p.paymentMethod}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-xs font-mono text-gray-400">{p.transactionId || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
