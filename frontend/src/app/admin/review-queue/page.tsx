'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import { profileReviewLabel } from '@/lib/labels';
import toast from 'react-hot-toast';

interface ReviewFlagItem {
  id: string;
  targetUserId: string;
  reason: string;
  status: string;
  notes?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    role: string;
    fullName?: string;
    selfieUrl?: string;
    profileVerificationStatus?: string;
  } | null;
}

export default function AdminReviewQueuePage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [queue, setQueue] = useState<ReviewFlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReviewFlagItem | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/review-queue');
      setQueue(unwrapData(res));
    } catch {
      setQueue([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      window.location.href = '/dashboard';
      return;
    }
    load();
  }, [isAuthenticated, user?.role]);

  const resolve = async (flagId: string, status: 'RESOLVED' | 'DISMISSED', markReviewed = false) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/review-flags/${flagId}`, { status, notes, markReviewed });
      toast.success(status === 'RESOLVED' ? 'Marked reviewed' : 'Flag dismissed');
      setSelected(null);
      setNotes('');
      await load();
    } catch {
      toast.error('Action failed');
    }
    setActionLoading(false);
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/dashboard/admin" className="text-primary-600 text-sm hover:underline">
          ← Admin dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-2">Review Queue</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manual selfie review only — label outcomes as &ldquo;Reviewed by RentGuard team&rdquo;, not ID verified.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading queue...</p>
        ) : queue.length === 0 ? (
          <p className="text-gray-500">No open review flags.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {queue.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full text-left bg-white rounded-xl border p-4 hover:border-primary-300 transition ${
                    selected?.id === item.id ? 'border-primary-500 ring-1 ring-primary-200' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-900">
                    {item.user?.fullName || item.user?.email || item.targetUserId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.reason} · {item.user?.role}
                  </p>
                  {item.user?.profileVerificationStatus && (
                    <p className="text-xs text-gray-400 mt-1">
                      {profileReviewLabel(item.user.profileVerificationStatus)}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20 h-fit">
                <h2 className="font-semibold text-gray-900 mb-4">Review user</h2>
                {selected.user?.selfieUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.user.selfieUrl}
                    alt="Selfie"
                    className="w-full max-w-xs rounded-xl border border-gray-200 mb-4"
                  />
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No selfie on file</p>
                )}
                <div className="text-sm space-y-1 mb-4">
                  <p>
                    <span className="text-gray-400">Email:</span> {selected.user?.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Phone:</span> {selected.user?.phone}
                  </p>
                  <p>
                    <span className="text-gray-400">Flag:</span> {selected.reason}
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Admin notes (optional)"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => resolve(selected.id, 'RESOLVED', true)}
                    disabled={actionLoading}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark reviewed
                  </button>
                  <button
                    onClick={() => resolve(selected.id, 'DISMISSED')}
                    disabled={actionLoading}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
