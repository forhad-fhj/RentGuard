'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  activeLeases: number;
  pendingVerifications: number;
  totalPayments: number;
  openDisputes: number;
}

interface PendingProfile {
  id: string;
  fullName: string;
  selfieUrl?: string;
  profileVerificationStatus: string;
  user: {
    id: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  };
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pending, setPending] = useState<{ tenants: PendingProfile[]; landlords: PendingProfile[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspendId, setSuspendId] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/verification/pending'),
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data);
    } catch {
      setStats(null);
      setPending(null);
    }
    setLoading(false);
  };

  const approveUser = async (userId: string) => {
    try {
      await api.post(`/admin/verification/${userId}/approve`);
      toast.success('Profile approved');
      fetchData();
    } catch {
      toast.error('Failed to approve profile');
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendId || !suspendReason) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${suspendId}/suspend`, { reason: suspendReason });
      toast.success('User suspended');
      setSuspendId('');
      setSuspendReason('');
      await fetchData();
    } catch {
      toast.error('Failed to suspend user');
    }
    setActionLoading(false);
  };

  const handleUnsuspend = async () => {
    if (!suspendId) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${suspendId}/unsuspend`);
      toast.success('User unsuspended');
      setSuspendId('');
    } catch {
      toast.error('Failed to unsuspend user');
    }
    setActionLoading(false);
  };

  if (!isAuthenticated) return null;

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-2">
          <span className="text-4xl">🔒</span>
          <p className="text-gray-600 font-medium">Admin access only</p>
          <Link href="/dashboard" className="text-primary-600 text-sm hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
        { label: 'Properties', value: stats.totalProperties, icon: '🏠' },
        { label: 'Active Leases', value: stats.activeLeases, icon: '📋' },
        { label: 'Pending KYC', value: stats.pendingVerifications, icon: '🪪' },
        { label: 'Payments', value: stats.totalPayments, icon: '💳' },
        { label: 'Open Disputes', value: stats.openDisputes, icon: '⚖️' },
      ]
    : [];

  const allPending = [
    ...(pending?.tenants || []).map((p) => ({ ...p, kind: 'Tenant' as const })),
    ...(pending?.landlords || []).map((p) => ({ ...p, kind: 'Landlord' as const })),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manual verification review — RentGuard is not a government verification service.
        </p>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : !stats ? (
          <div className="text-center py-20 text-gray-500">Failed to load dashboard stats</div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className="rounded-xl border bg-white border-gray-100 p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Pending Selfie Review</h2>
              {allPending.length === 0 ? (
                <p className="text-sm text-gray-500">No profiles awaiting review.</p>
              ) : (
                <ul className="space-y-3">
                  {allPending.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {p.fullName} · {p.kind}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.user.email} · {p.profileVerificationStatus}
                        </p>
                        {p.selfieUrl && (
                          <a
                            href={p.selfieUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                          >
                            View selfie →
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => approveUser(p.user.id)}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">User Management</h2>
              <form onSubmit={handleSuspend} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
                    <input
                      type="text"
                      value={suspendId}
                      onChange={(e) => setSuspendId(e.target.value)}
                      placeholder="Enter user UUID"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reason</label>
                    <input
                      type="text"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Reason for suspension"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading || !suspendId || !suspendReason}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Suspend User
                  </button>
                  <button
                    type="button"
                    onClick={handleUnsuspend}
                    disabled={actionLoading || !suspendId}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Unsuspend User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
