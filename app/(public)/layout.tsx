import Link from "next/link";
import Image from "next/image";
import HeaderActions from "@/components/HeaderActions";
import { Mail, Phone, MapPin } from "lucide-react";

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
          <Link href="/training" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/ecrmi-logo.jpeg"
                alt="ECRMI Logo"
                fill
                priority
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold">
              ECRMI <span className="text-blue-600">Training</span>
            </span>
          </Link>

          <HeaderActions />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14">

          {/* BRAND */}
          <div>
            <div className="relative w-40 h-40 mb-4">
              <Image
                src="/ecrmi-logo.jpeg"
                alt="ECRMI Logo"
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Emergency, Crisis & Disaster Risk Management Institute
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="hover:text-white">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white">
                  Verify Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://ecrmi.org.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Main Website
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-blue-400" />
                <a
                  href="mailto:info@ecrmi.org.ng"
                  className="hover:text-white"
                >
                  info@ecrmi.org.ng
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-blue-400" />
                <span>
                  08055912022<br />
                  08039392687<br />
                  08168570185
                </span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400" />
                <span>
                  Lagos, Nigeria
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs mt-14 text-gray-500">
          © 2026 Emergency, Crisis & Disaster Risk Management Institute
        </div>
      </footer>
    </>
  );
}