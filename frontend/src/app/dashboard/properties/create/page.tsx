'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';

export default function CreatePropertyPage() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        propertyType: 'APARTMENT',
        city: '',
        district: '',
        address: '',
        rentAmount: '',
        depositAmount: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        amenities: '',
        imageUrl: '',
        availableFrom: '',
        availableTo: '',
    });

    if (!isAuthenticated) { if (typeof window !== 'undefined') window.location.href = '/auth/login'; return null; }
    if (user?.role !== 'LANDLORD') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
                <div className="flex-1 flex items-center justify-center flex-col gap-2">
                    <span className="text-4xl">🔒</span>
                    <p className="text-gray-600 font-medium">Landlord access only</p>
                    <Link href="/dashboard" className="text-primary-600 text-sm hover:underline">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/properties', {
                title: form.title,
                description: form.description,
                propertyType: form.propertyType,
                city: form.city,
                district: form.district,
                address: form.address,
                rentAmount: Number(form.rentAmount),
                depositAmount: Number(form.depositAmount) || 0,
                bedrooms: Number(form.bedrooms) || 0,
                bathrooms: Number(form.bathrooms) || 0,
                squareFeet: Number(form.squareFeet) || 0,
                amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
                images: form.imageUrl ? [form.imageUrl.trim()] : [],
                availableFrom: form.availableFrom,
                availableTo: form.availableTo || undefined,
            });
            setSuccess(true);
        } catch (error: any) { 
            console.error(error.response?.data);
            alert(`Failed: ${Array.isArray(error.response?.data?.message) ? error.response.data.message.join(', ') : (error.response?.data?.message || 'Unknown error')}`); 
        }
        setLoading(false);
    };

    const update = (field: string, value: string) => setForm({ ...form, [field]: value });

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
                <div className="flex-1 flex items-center justify-center flex-col gap-3">
                    <span className="text-5xl">🎉</span>
                    <h2 className="text-xl font-bold text-gray-900">Draft saved!</h2>
                    <p className="text-gray-500 text-sm">Add a photo URL if needed, then publish from My Listings.</p>
                    <Link href="/landlord/properties" className="text-primary-600 font-medium hover:underline mt-2">My Listings →</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10">
                <Link href="/dashboard/properties" className="text-primary-600 text-sm font-medium hover:underline">← Back to Properties</Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-8">List a New Property</h1>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input required type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Spacious 3BR Apartment in Gulshan" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe your property..." rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                            <select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500">
                                <option value="APARTMENT">Apartment</option>
                                <option value="HOUSE">House</option>
                                <option value="FLAT">Flat</option>
                                <option value="STUDIO">Studio</option>
                                <option value="CONDOMINIUM">Condominium</option>
                                <option value="COMMERCIAL">Commercial</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900">Location</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input required type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Dhaka" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                <input required type="text" value={form.district} onChange={(e) => update('district', e.target.value)} placeholder="Gulshan" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                            <input required type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="House 12, Road 5, Gulshan 2" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900">Pricing & Details</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (৳) *</label>
                                <input required type="number" value={form.rentAmount} onChange={(e) => update('rentAmount', e.target.value)} placeholder="15000" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (৳)</label>
                                <input type="number" value={form.depositAmount} onChange={(e) => update('depositAmount', e.target.value)} placeholder="30000" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} placeholder="3" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} placeholder="2" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                                <input type="number" value={form.squareFeet} onChange={(e) => update('squareFeet', e.target.value)} placeholder="1200" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                            <input type="text" value={form.amenities} onChange={(e) => update('amenities', e.target.value)} placeholder="WiFi, Parking, Generator, Lift (comma separated)" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL (required to publish)</label>
                            <input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                            <p className="text-xs text-gray-400 mt-1">Saved as draft until you publish from My Listings.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available From *</label>
                                <input
                                    required
                                    type="date"
                                    value={form.availableFrom}
                                    onChange={(e) => update('availableFrom', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available To (optional)</label>
                                <input
                                    type="date"
                                    value={form.availableTo}
                                    onChange={(e) => update('availableTo', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                        {loading ? 'Creating...' : 'Save as draft'}
                    </button>
                </form>
            </main>
            <Footer />
        </div>
    );
}
