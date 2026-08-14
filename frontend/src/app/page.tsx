import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-red-50 -z-10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30 -z-10" />

          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase animate-fade-in">
                🇧🇩 Built for Bangladesh&apos;s Rental Market
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight animate-fade-in-up">
                Secure Your Rental
                <span className="block gradient-text">With Trust & Technology</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
                RentGuard replaces manual police verification with AI-powered NID verification,
                transparent tenant credit scores, and smart digital lease management.
              </p>
              <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up delay-300" style={{ animationFillMode: 'both' }}>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
                >
                  Start Free →
                </Link>
                <Link
                  href="#how-it-works"
                  className="bg-white text-gray-700 px-8 py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">AES-256</div>
                <p className="text-gray-400 text-xs mt-1">Military-Grade Encryption</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
                <p className="text-gray-400 text-xs mt-1">Verified Tenants</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                <p className="text-gray-400 text-xs mt-1">Fraud Monitoring</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">0–1000</div>
                <p className="text-gray-400 text-xs mt-1">Credit Score Range</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 md:py-28 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple. Secure. Smart.</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Get started in minutes with our streamlined verification process</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '01',
                  icon: '🪪',
                  title: 'Verify Identity',
                  desc: 'Upload your NID and a selfie. Our AI performs OCR extraction, biometric face matching, and liveness detection in seconds.',
                },
                {
                  step: '02',
                  icon: '📊',
                  title: 'Build Credit Score',
                  desc: 'Your rental history, payment punctuality, and behavior build a transparent 0-1000 credit score that landlords trust.',
                },
                {
                  step: '03',
                  icon: '📝',
                  title: 'Sign & Move In',
                  desc: 'Browse properties, apply, and sign digital lease contracts with e-signatures. Pay rent via bKash, Nagad, or bank transfer.',
                },
              ].map((item, i) => (
                <div key={i} className="relative bg-white p-8 rounded-2xl border border-gray-100 card-hover group">
                  <span className="absolute top-6 right-6 text-5xl font-black text-gray-100 group-hover:text-primary-100 transition">{item.step}</span>
                  <span className="text-3xl mb-4 block">{item.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* Core Features */}
        <section id="features" className="py-20 md:py-28 scroll-mt-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
              <p className="text-gray-500 max-w-xl mx-auto">A complete rental ecosystem — from verification to move-in</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: '🪪', title: 'NID Verification', desc: 'AI-powered OCR extraction from National ID cards with biometric face matching and liveness detection.' },
                { icon: '📊', title: 'Tenant Credit Score', desc: 'Transparent 0-1000 scoring based on 8 factors: payment history, lease completion, disputes, and more.' },
                { icon: '🏠', title: 'Property Listings', desc: 'Smart property search with filters for city, district, type, price range, bedrooms, and amenities.' },
                { icon: '📝', title: 'Digital Leases', desc: 'Smart contracts with dual e-signatures, auto-renewal, breach detection, and PDF generation.' },
                { icon: '💳', title: 'Payment Integration', desc: 'Pay rent via bKash, Nagad, or bank transfer. Automated late fee calculation and payment tracking.' },
                { icon: '⚖️', title: 'Dispute Resolution', desc: 'Evidence-based dispute system with threaded messaging, moderator review, and fair arbitration.' },
                { icon: '🔍', title: 'Fraud Detection', desc: 'ML-powered anomaly detection: duplicate NID, suspicious behavior, rental hopping, IP anomalies.' },
                { icon: '🔔', title: 'Smart Notifications', desc: 'Real-time alerts for payments due, lease events, verification updates, and dispute outcomes.' },
                { icon: '🛡️', title: 'Admin Dashboard', desc: 'Complete oversight: user management, verification queues, fraud alerts, and compliance reports.' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 card-hover group">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Security */}
        <section id="trust" className="py-20 md:py-28 scroll-mt-20 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-white/10 text-primary-300 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">Security</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trust & Security First</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Enterprise-grade security built into every layer of the platform</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: '🔐', title: 'AES-256 Encryption', desc: 'All sensitive data encrypted at rest and in transit' },
                { icon: '🛡️', title: 'RBAC & JWT Auth', desc: 'Role-based access with token rotation' },
                { icon: '🔒', title: 'TLS 1.3', desc: 'All communications encrypted end-to-end' },
                { icon: '📋', title: 'Audit Logging', desc: 'Immutable logs for every action taken' },
                { icon: '🚫', title: 'Rate Limiting', desc: 'Brute force & DDoS protection built-in' },
                { icon: '📱', title: '2FA Support', desc: 'Two-factor via OTP SMS and email' },
                { icon: '🖥️', title: 'Device Binding', desc: 'IP fingerprinting and device tracking' },
                { icon: '📜', title: 'GDPR Compliant', desc: 'Consent management and data privacy' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition group">
                  <span className="text-xl mb-2 block">{item.icon}</span>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-primary-300 transition">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Tenants & Landlords */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">For Everyone</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Designed for Both Sides</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Whether you&apos;re renting or listing, RentGuard has you covered</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-primary-50 to-red-50 rounded-2xl p-8 border border-primary-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">🏠 For Tenants</h3>
                <p className="text-sm text-gray-600 mb-5">Build your rental reputation and find trusted homes</p>
                <ul className="space-y-3">
                  {[
                    'One-time NID verification for all rentals',
                    'Build a portable credit score (0-1000)',
                    'Browse verified properties with smart filters',
                    'Sign digital leases from anywhere',
                    'Pay rent via bKash, Nagad, or bank',
                    'Raise disputes with evidence tracking',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-600 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">🔑 For Landlords</h3>
                <p className="text-sm text-gray-600 mb-5">Find trustworthy tenants and manage properties with ease</p>
                <ul className="space-y-3">
                  {[
                    'View verified tenant credit scores',
                    'List properties with photos & amenities',
                    'Receive and review tenant applications',
                    'Automated lease creation & signing',
                    'Track rent payments in real-time',
                    'Fraud alerts and risk assessments',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-800 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-gray-900">Built With Modern Technology</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {['NestJS', 'Next.js 14', 'PostgreSQL', 'Prisma', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS S3', 'Tesseract.js'].map((tech, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Experience
                <span className="block gradient-text">Secure Renting?</span>
              </h2>
              <p className="text-gray-500 mb-8">
                Join RentGuard and be part of Bangladesh&apos;s most trusted rental ecosystem.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-white text-gray-700 px-8 py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
