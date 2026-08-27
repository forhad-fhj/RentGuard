'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import { propertyStatusLabel } from '@/lib/labels';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  city: string;
  rentAmount: string | number;
  status: string;
  images: string[];
  applications?: { id: string }[];
}

export default function LandlordPropertiesPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/properties/mine');
      setProperties(unwrapData(res));
    } catch {
      setProperties([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    if (user?.role !== 'LANDLORD') {
      window.location.href = '/dashboard';
      return;
    }
    load();
  }, [isAuthenticated, user?.role]);

  const publish = async (id: string) => {
    setActionId(id);
    try {
      await api.post(`/properties/${id}/publish`);
      toast.success('Listing published');
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message || 'Publish failed';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
    setActionId(null);
  };

  const archive = async (id: string) => {
    setActionId(id);
    try {
      await api.post(`/properties/${id}/archive`);
      toast.success('Listing archived');
      await load();
    } catch {
      toast.error('Failed to archive');
    }
    setActionId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-primary-600 text-sm hover:underline">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">My Listings</h1>
          </div>
          <Link
            href="/dashboard/properties/create"
            className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700"
          >
            + New listing
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : properties.length === 0 ? (
          <p className="text-gray-500">No listings yet. Create one as a draft, add a photo URL, then publish.</p>
        ) : (
          <div className="space-y-4">
            {properties.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500">
                    {p.city} · ৳{Number(p.rentAmount).toLocaleString()}/mo
                  </p>
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {propertyStatusLabel(p.status)}
                  </span>
                  {(p.applications?.length ?? 0) > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {p.applications!.length} pending applicant(s)
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === 'DRAFT' && (
                    <button
                      onClick={() => publish(p.id)}
                      disabled={actionId === p.id}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  {p.status === 'ACTIVE' && (
                    <Link
                      href={`/landlord/properties/${p.id}/applicants`}
                      className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      View applicants
                    </Link>
                  )}
                  {p.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => archive(p.id)}
                      disabled={actionId === p.id}
                      className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Archive
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
