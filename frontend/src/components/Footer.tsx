import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold text-white">RentGuard</Link>
            <p className="mt-3 text-sm text-gray-400 max-w-sm leading-relaxed">
              Secure Digital Tenant Verification & Rental Ecosystem — replacing manual verification with AI-powered trust for Bangladesh.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="px-2.5 py-1 bg-white/10 rounded text-xs text-gray-300">NestJS</span>
              <span className="px-2.5 py-1 bg-white/10 rounded text-xs text-gray-300">Next.js</span>
              <span className="px-2.5 py-1 bg-white/10 rounded text-xs text-gray-300">PostgreSQL</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
              <li><Link href="/#trust" className="text-gray-400 hover:text-white transition">Security</Link></li>
              <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 text-xs text-gray-500 text-center">
          © {currentYear} RentGuard. Built with 🔐 for Bangladesh.
        </div>
      </div>
    </footer>
  );
}
