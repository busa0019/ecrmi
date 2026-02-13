import Link from "next/link";
import Image from "next/image";

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ===== MEMBERSHIP HEADER (LOGO ONLY) ===== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/membership" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/ecrmi-logo.jpeg"
                alt="ECRMI Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold">
              ECRMI <span className="text-blue-600">Membership</span>
            </span>
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}