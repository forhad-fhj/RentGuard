import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary-600">RentGuard</Link>
            <p className="mt-2 text-sm text-gray-600 max-w-sm">
              Secure Digital Tenant Verification & Rental Ecosystem for Bangladesh.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/#how-it-works" className="hover:text-primary-600 transition">How It Works</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-600 transition">Register</Link></li>
              <li><Link href="/auth/login" className="hover:text-primary-600 transition">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary-600 transition">About</a></li>
              <li><a href="#" className="hover:text-primary-600 transition">Contact</a></li>
              <li><a href="#" className="hover:text-primary-600 transition">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
          © {currentYear} RentGuard. Built for Bangladesh.
        </div>
      </div>
    </footer>
  );
}
