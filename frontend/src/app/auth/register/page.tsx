'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackendStatus from '@/components/BackendStatus';
import SelfieCapture from '@/components/SelfieCapture';

type Step = 'details' | 'selfie';

export default function RegisterPage() {
  const router = useRouter();
  const registerInit = useAuthStore((s) => s.registerInit);
  const registerSelfie = useAuthStore((s) => s.registerSelfie);
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
  });

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await registerInit({
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      setRegistrationToken(result.registrationToken);
      setStep('selfie');
      toast.success('Now capture your selfie to activate your account');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationToken) {
      toast.error('Registration session expired. Start again.');
      setStep('details');
      return;
    }
    if (!selfieFile) {
      toast.error('Selfie is required — capture or upload a photo');
      return;
    }
    setLoading(true);
    try {
      await registerSelfie(registrationToken, selfieFile);
      toast.success('Account activated!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload selfie';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BackendStatus />
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex gap-2 mb-6">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${step === 'details' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                1. Details
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${step === 'selfie' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                2. Selfie
              </span>
            </div>

            {step === 'details' ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
                <p className="text-gray-600 text-sm mb-6">Join RentGuard as a tenant or landlord.</p>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="+8801712345678" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="TENANT">Tenant</option>
                      <option value="LANDLORD">Landlord</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                    <input type="password" required value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Continue to selfie'}
                  </button>
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                        <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.98C4.01 20.55 7.7 23 12 23Z" fill="#34A853"/>
                        <path d="M5.88 14.13C5.66 13.47 5.54 12.75 5.54 12C5.54 11.25 5.66 10.53 5.88 9.87V7.02H2.21C1.46 8.52 1.05 10.2 1.05 12C1.05 13.8 1.46 15.48 2.21 16.98L5.88 14.13Z" fill="#FBBC05"/>
                        <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.35 3.88C17.45 2.1 14.96 1 12 1C7.7 1 4.01 3.45 2.21 7.02L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify it&apos;s you</h1>
                <p className="text-gray-600 text-sm mb-6">Your account is created but inactive until you upload a selfie.</p>
                <form onSubmit={handleSelfieSubmit} className="space-y-4">
                  <SelfieCapture onCapture={setSelfieFile} disabled={loading} />
                  <button type="submit" disabled={loading || !selfieFile} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
                    {loading ? 'Activating account...' : 'Activate account'}
                  </button>
                  <button type="button" onClick={() => setStep('details')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                    ← Back to details
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
