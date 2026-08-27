'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { unwrapData } from '@/lib/api-helpers';
import { propertyStatusLabel } from '@/lib/labels';

interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  rentAmount: string | number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  images: string[];
}

interface PaginatedProperties {
  items: Property[];
  total: number;
  page: number;
  totalPages: number;
}

export default function PublicPropertiesPage() {
  const [data, setData] = useState<PaginatedProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minRent) params.append('minRent', filters.minRent);
      if (filters.maxRent) params.append('maxRent', filters.maxRent);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      const res = await api.get(`/properties?${params.toString()}`);
      setData(unwrapData(res));
    } catch {
      setData({ items: [], total: 0, page: 1, totalPages: 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Rentals</h1>
        <p className="text-sm text-gray-500 mb-8">Find your next home across Bangladesh</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProperties();
          }}
          className="bg-white rounded-xl border border-gray-200 p-5 mb-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Min Rent (৳)"
              value={filters.minRent}
              onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Max Rent (৳)"
              value={filters.maxRent}
              onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Bedrooms"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700">
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-center py-20 text-gray-500">Loading listings...</p>
        ) : !data?.items.length ? (
          <p className="text-center py-20 text-gray-500">No active listings found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl opacity-40">🏠</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {p.city}
                    {p.district ? `, ${p.district}` : ''}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary-600">
                      ৳{Number(p.rentAmount).toLocaleString()}
                      <span className="text-xs font-normal text-gray-400">/mo</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {p.bedrooms} bed · {p.bathrooms} bath
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
