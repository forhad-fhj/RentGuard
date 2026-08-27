'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  address: string;
  rentAmount: string | number;
  depositAmount: string | number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rules: string[];
  images: string[];
  status: string;
}

export default function PublicPropertyDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(unwrapData(res));
      } catch {
        setProperty(null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    setApplying(true);
    try {
      await api.post(`/properties/${id}/apply`, { message: message || undefined });
      setApplied(true);
      toast.success('Application submitted');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to apply';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <p className="text-gray-600">Listing not found</p>
          <Link href="/properties" className="text-primary-600 text-sm hover:underline">
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const canApply = user?.role === 'TENANT' && property.status === 'ACTIVE';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/properties" className="text-primary-600 text-sm hover:underline">
          ← Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl overflow-hidden flex items-center justify-center">
              {property.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl opacity-30">🏠</span>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{property.address}</p>
              <p className="text-sm text-gray-400">
                {property.city}
                {property.district ? `, ${property.district}` : ''}
              </p>
              <p className="text-gray-600 mt-4 leading-relaxed">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-20">
            <p className="text-3xl font-bold text-primary-600">
              ৳{Number(property.rentAmount).toLocaleString()}
              <span className="text-sm text-gray-400 font-normal"> /month</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Deposit: ৳{Number(property.depositAmount || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {property.bedrooms} bed · {property.bathrooms} bath
            </p>

            {canApply && !applied && (
              <div className="mt-6 space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message to landlord (optional)"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}

            {applied && (
              <p className="mt-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                Application submitted
              </p>
            )}

            {!isAuthenticated && property.status === 'ACTIVE' && (
              <Link
                href="/auth/login"
                className="mt-6 block text-center bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                Sign in to apply
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
