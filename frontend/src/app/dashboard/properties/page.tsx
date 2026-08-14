'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

interface Property {
    id: string;
    title: string;
    description: string;
    propertyType: string;
    city: string;
    district: string;
    address: string;
    monthlyRent: number;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    images: string[];
    isAvailable: boolean;
    createdAt: string;
}

export default function PropertiesPage() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: '', propertyType: '', minRent: '', maxRent: '' });

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchProperties();
    }, [isAuthenticated]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.minRent) params.append('minRent', filters.minRent);
            if (filters.maxRent) params.append('maxRent', filters.maxRent);
            const res = await api.get(`/properties?${params.toString()}`);
            setProperties(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch {
            setProperties([]);
        }
        setLoading(false);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties();
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">← Dashboard</Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">Properties</h1>
                    </div>
                    {user?.role === 'LANDLORD' && (
                        <Link href="/dashboard/properties/create" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                            + List Property
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <form onSubmit={handleFilter} className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        <select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                            <option value="">All Types</option>
                            <option value="APARTMENT">Apartment</option>
                            <option value="HOUSE">House</option>
                            <option value="SUBLET">Sublet</option>
                            <option value="MESS">Mess</option>
                            <option value="COMMERCIAL">Commercial</option>
                        </select>
                        <input type="number" placeholder="Min Rent (৳)" value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        <input type="number" placeholder="Max Rent (৳)" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        <button type="submit" className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition">Search</button>
                    </div>
                </form>

                {/* Property Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading properties...</div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-4xl mb-4 block">🏠</span>
                        <p className="text-gray-600 font-medium">No properties found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((p) => (
                            <Link key={p.id} href={`/dashboard/properties/${p.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
                                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                                    <span className="text-5xl opacity-40">🏠</span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-1">{p.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {p.isAvailable ? 'Available' : 'Taken'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{p.city}{p.district ? `, ${p.district}` : ''}</p>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-primary-600">৳{p.monthlyRent?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/month</span></span>
                                        <div className="flex gap-3 text-xs text-gray-400">
                                            {p.bedrooms && <span>{p.bedrooms} bed</span>}
                                            {p.bathrooms && <span>{p.bathrooms} bath</span>}
                                        </div>
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
