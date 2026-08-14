'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
    securityDeposit: number;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    amenities: string[];
    images: string[];
    isAvailable: boolean;
    createdAt: string;
    landlord?: { user?: { email: string } };
}

export default function PropertyDetailPage() {
    const { id } = useParams();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { window.location.href = '/auth/login'; return; }
        fetchProperty();
    }, [isAuthenticated, id]);

    const fetchProperty = async () => {
        try {
            const res = await api.get(`/properties/${id}`);
            setProperty(res.data);
        } catch { setProperty(null); }
        setLoading(false);
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post(`/properties/${id}/apply`, { message: message || 'I am interested in this property.' });
            setApplied(true);
        } catch { alert('Failed to apply. You may have already applied.'); }
        setApplying(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
                <div className="flex-1 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
                <div className="flex-1 flex items-center justify-center flex-col gap-2">
                    <span className="text-4xl">😕</span>
                    <p className="text-gray-600 font-medium">Property not found</p>
                    <Link href="/dashboard/properties" className="text-primary-600 text-sm hover:underline">← Back to Properties</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <Link href="/dashboard/properties" className="text-primary-600 text-sm font-medium hover:underline mb-4 inline-block">← Back to Properties</Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                            <span className="text-7xl opacity-30">🏠</span>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${property.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {property.isAvailable ? 'Available' : 'Taken'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{property.address}</p>
                            <p className="text-sm text-gray-400 mb-6">{property.city}{property.district ? `, ${property.district}` : ''}</p>
                            <p className="text-gray-600 leading-relaxed">{property.description}</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">🛏️</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{property.bedrooms || '-'}</p>
                                    <p className="text-xs text-gray-400">Bedrooms</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">🚿</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{property.bathrooms || '-'}</p>
                                    <p className="text-xs text-gray-400">Bathrooms</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">📐</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{property.areaSqft || '-'}</p>
                                    <p className="text-xs text-gray-400">Sq Ft</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">🏢</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{property.propertyType}</p>
                                    <p className="text-xs text-gray-400">Type</p>
                                </div>
                            </div>
                        </div>

                        {property.amenities && property.amenities.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {property.amenities.map((a, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
                            <div className="text-center mb-6">
                                <span className="text-3xl font-bold text-primary-600">৳{property.monthlyRent?.toLocaleString()}</span>
                                <span className="text-sm text-gray-400"> /month</span>
                                {property.securityDeposit && (
                                    <p className="text-xs text-gray-400 mt-1">Security Deposit: ৳{property.securityDeposit?.toLocaleString()}</p>
                                )}
                            </div>

                            {user?.role === 'TENANT' && property.isAvailable && !applied && (
                                <div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write a message to the landlord (optional)..."
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-500 resize-none"
                                        rows={3}
                                    />
                                    <button onClick={handleApply} disabled={applying} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                                        {applying ? 'Applying...' : 'Apply for this Property'}
                                    </button>
                                </div>
                            )}

                            {applied && (
                                <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-2xl">✅</span>
                                    <p className="text-sm font-medium text-green-700 mt-1">Application Submitted!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
