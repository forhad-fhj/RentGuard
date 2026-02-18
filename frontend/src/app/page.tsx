import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            RentGuard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Secure Digital Tenant Verification & Rental Ecosystem for Bangladesh
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
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
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">1. Identity Verification</h3>
            <p className="text-gray-600">
              Secure NID verification with biometric face matching and liveness detection
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">2. Credit Score</h3>
            <p className="text-gray-600">
              Transparent tenant credit scoring based on rental history and behavior
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">3. Digital Lease</h3>
            <p className="text-gray-600">
              Smart digital lease contracts with automated payment tracking
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Trust & Security</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">AES-256</div>
              <p>Military-grade encryption</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p>Verified tenants</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p>Fraud monitoring</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
