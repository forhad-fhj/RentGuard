'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

interface Dispute {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    messages?: { id: string; message: string; createdAt: string; user?: { email: string } }[];
}

export default function DisputesPage() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM', leaseId: '' });

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchDisputes();
    }, [isAuthenticated]);

    const fetchDisputes = async () => {
        try {
            const res = await api.get('/disputes');
            setDisputes(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch { setDisputes([]); }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/disputes', form);
            setShowCreate(false);
            setForm({ title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM', leaseId: '' });
            await fetchDisputes();
        } catch { alert('Failed to create dispute.'); }
        setCreating(false);
    };

    const handleMessage = async () => {
        if (!selectedDispute || !newMessage.trim()) return;
        try {
            await api.post(`/disputes/${selectedDispute.id}/message`, { message: newMessage });
            setNewMessage('');
            const res = await api.get(`/disputes/${selectedDispute.id}`);
            setSelectedDispute(res.data);
        } catch { alert('Failed to send message.'); }
    };

    const statusStyles: Record<string, string> = {
        OPEN: 'bg-blue-50 text-blue-700',
        IN_PROGRESS: 'bg-yellow-50 text-yellow-700',
        RESOLVED: 'bg-green-50 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-500',
    };

    const priorityStyles: Record<string, string> = {
        LOW: 'text-gray-500',
        MEDIUM: 'text-yellow-600',
        HIGH: 'text-orange-600',
        URGENT: 'text-red-600',
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">← Dashboard</Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">Disputes</h1>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                        + New Dispute
                    </button>
                </div>

                {/* Create Form */}
                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-8 space-y-4">
                        <h2 className="font-semibold text-gray-900">Raise a Dispute</h2>
                        <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Dispute title" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 resize-none" />
                        <div className="grid sm:grid-cols-3 gap-4">
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="PAYMENT">Payment</option>
                                <option value="SECURITY_DEPOSIT">Security Deposit</option>
                                <option value="LEASE_TERMS">Lease Terms</option>
                                <option value="NEIGHBOR">Neighbor Issue</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                                <option value="LOW">Low Priority</option>
                                <option value="MEDIUM">Medium Priority</option>
                                <option value="HIGH">High Priority</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                            <input type="text" value={form.leaseId} onChange={(e) => setForm({ ...form, leaseId: e.target.value })} placeholder="Lease ID (optional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button type="submit" disabled={creating} className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                                {creating ? 'Creating...' : 'Submit Dispute'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Dispute Detail Modal */}
                {selectedDispute && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDispute(null)}>
                        <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{selectedDispute.title}</h2>
                                        <p className="text-xs text-gray-400 mt-1">{selectedDispute.category} · {new Date(selectedDispute.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-600">{selectedDispute.description}</p>
                                <div className="border-t border-gray-100 pt-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Messages</h3>
                                    <div className="space-y-3 max-h-48 overflow-y-auto">
                                        {(selectedDispute.messages || []).map((m) => (
                                            <div key={m.id} className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-medium text-gray-700">{m.user?.email || 'User'}</span>
                                                    <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{m.message}</p>
                                            </div>
                                        ))}
                                        {(!selectedDispute.messages || selectedDispute.messages.length === 0) && (
                                            <p className="text-gray-400 text-sm text-center py-3">No messages yet</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && handleMessage()}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                                    <button onClick={handleMessage} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Disputes List */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">⚖️</span>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Disputes</h2>
                        <p className="text-sm text-gray-500">Good news! You have no open disputes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {disputes.map((d) => (
                            <button key={d.id} onClick={async () => {
                                try {
                                    const res = await api.get(`/disputes/${d.id}`);
                                    setSelectedDispute(res.data);
                                } catch { setSelectedDispute(d); }
                            }} className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 card-hover">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900">{d.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[d.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {d.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{d.description}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            <span>{d.category}</span>
                                            <span className={priorityStyles[d.priority] || ''}>{d.priority}</span>
                                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-300 text-lg">→</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
