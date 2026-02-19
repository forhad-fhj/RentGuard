import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              RentGuard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Secure Digital Tenant Verification & Rental Ecosystem for Bangladesh
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-20 scroll-mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Identity Verification</h3>
              <p className="text-gray-600">
                Secure NID verification with biometric face matching and liveness detection
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Credit Score</h3>
              <p className="text-gray-600">
                Transparent tenant credit scoring based on rental history and behavior
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Digital Lease</h3>
              <p className="text-gray-600">
                Smart digital lease contracts with automated payment tracking
              </p>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="trust" className="bg-primary-600 text-white py-20 scroll-mt-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Trust & Security</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">AES-256</div>
                <p className="text-primary-100">Military-grade encryption</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <p className="text-primary-100">Verified tenants</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p className="text-primary-100">Fraud monitoring</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="features" className="container mx-auto px-4 py-20 text-center scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Join RentGuard and experience secure, transparent rental verification.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Create Account
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
