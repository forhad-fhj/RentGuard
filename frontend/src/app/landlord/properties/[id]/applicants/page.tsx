'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import { profileReviewLabel, applicationStatusLabel } from '@/lib/labels';
import toast from 'react-hot-toast';

interface Applicant {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  tenant: {
    id: string;
    fullName: string;
    selfieUrl?: string;
    profileVerificationStatus: string;
    creditScore?: { score: number; riskCategory: string };
    user: { email: string; phone: string };
  };
}

export default function PropertyApplicantsPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get(`/properties/${id}/applications`);
      setApplicants(unwrapData(res));
    } catch {
      setApplicants([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'LANDLORD') {
      window.location.href = '/auth/login';
      return;
    }
    load();
  }, [isAuthenticated, user?.role, id]);

  const review = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionId(applicationId);
    try {
      await api.patch(`/applications/${applicationId}`, { status });
      toast.success(status === 'APPROVED' ? 'Applicant accepted' : 'Applicant rejected');
      await load();
    } catch {
      toast.error('Action failed');
    }
    setActionId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/landlord/properties" className="text-primary-600 text-sm hover:underline">
          ← My listings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">Applicants</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : applicants.length === 0 ? (
          <p className="text-gray-500">No applications yet.</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap gap-4">
                  {app.tenant.selfieUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.tenant.selfieUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold text-gray-900">{app.tenant.fullName}</p>
                    <p className="text-xs text-gray-500">{app.tenant.user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {profileReviewLabel(app.tenant.profileVerificationStatus)}
                    </p>
                    {app.tenant.creditScore && (
                      <p className="text-xs text-gray-600 mt-1">
                        Score band: {app.tenant.creditScore.riskCategory} ({app.tenant.creditScore.score})
                      </p>
                    )}
                    {app.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{app.message}&rdquo;</p>
                    )}
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                      {applicationStatusLabel(app.status)}
                    </span>
                  </div>
                  {app.status === 'PENDING' && (
                    <div className="flex gap-2 items-start">
                      <button
                        onClick={() => review(app.id, 'APPROVED')}
                        disabled={actionId === app.id}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => review(app.id, 'REJECTED')}
                        disabled={actionId === app.id}
                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
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
