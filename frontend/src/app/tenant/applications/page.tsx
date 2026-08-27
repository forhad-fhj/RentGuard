'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import { applicationStatusLabel } from '@/lib/labels';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    district: string;
    rentAmount: string | number;
    status: string;
  };
}

export default function TenantApplicationsPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/applications/mine');
      setApplications(unwrapData(res));
    } catch {
      setApplications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'TENANT') {
      window.location.href = '/auth/login';
      return;
    }
    load();
  }, [isAuthenticated, user?.role]);

  const withdraw = async (id: string) => {
    try {
      await api.patch(`/applications/${id}`, { status: 'WITHDRAWN' });
      toast.success('Application withdrawn');
      await load();
    } catch {
      toast.error('Failed to withdraw');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/dashboard" className="text-primary-600 text-sm hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">My Applications</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">You haven&apos;t applied to any listings yet.</p>
            <Link href="/properties" className="text-primary-600 font-medium hover:underline">
              Browse properties →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap justify-between gap-4">
                <div>
                  <Link href={`/properties/${app.property.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                    {app.property.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {app.property.city}
                    {app.property.district ? `, ${app.property.district}` : ''} · ৳
                    {Number(app.property.rentAmount).toLocaleString()}/mo
                  </p>
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                    {applicationStatusLabel(app.status)}
                  </span>
                  {app.message && (
                    <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{app.message}&rdquo;</p>
                  )}
                </div>
                {app.status === 'PENDING' && (
                  <button
                    onClick={() => withdraw(app.id)}
                    className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 h-fit"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
