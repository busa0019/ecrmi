import Link from "next/link";
import HeaderActions from "@/components/HeaderActions";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ===== PUBLIC HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="text-lg font-bold">
              ECRMI <span className="text-blue-600">Training</span>
            </span>
          </Link>

          {/* ✅ Client‑side nav logic lives here */}
          <HeaderActions />
        </div>
      </header>

      {/* ===== PAGE CONTENT ===== */}
      <main className="flex-1">{children}</main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-white font-bold mb-4">ECRMI</h3>
            <p>
              Emergency, Crisis & Disaster Risk Management Institute
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses">Browse Courses</Link>
              </li>
              <li>
                <Link href="/verify">Verify Certificate</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ecrmi.org.ng"
                  target="_blank"
                  rel="noreferrer"
                >
                  Main Website
                </a>
              </li>
              <li>
                <a
                  href="https://ecrmi.org.ng/contact"
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs mt-12">
          © 2026 Emergency, Crisis & Disaster Risk Management Institute
        </div>
      </footer>
    </>
  );
}