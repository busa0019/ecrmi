import Link from "next/link";
import { ShieldCheck, FileText, BadgeCheck } from "lucide-react";

export default function MembershipLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      {/* ===== HEADER ===== */}
      <section className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ECRMI Membership
          </h1>

          <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg">
            Join the Emergency, Crisis & Disaster Risk Management Institute
            (ECRMI) and become a recognized professional in emergency and risk
            management practice.
          </p>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 sm:grid-cols-3">
          <div className="bg-white rounded-2xl border p-6 text-center">
            <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Professional Recognition
            </h3>
            <p className="text-sm text-gray-600">
              Gain official recognition as a certified member of ECRMI with
              verifiable credentials.
            </p>
          </div>

          <div className="bg-white rounded-2xl border p-6 text-center">
            <FileText className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Official Documentation
            </h3>
            <p className="text-sm text-gray-600">
              Receive an official membership certificate and membership letter
              issued by ECRMI.
            </p>
          </div>

          <div className="bg-white rounded-2xl border p-6 text-center">
            <BadgeCheck className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              QR‑Verified Certificate
            </h3>
            <p className="text-sm text-gray-600">
              Your membership certificate includes a QR code for public
              authenticity verification.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-gray-600 text-base sm:text-lg">
            Begin your application or check the status of an existing
            application below.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership/apply"
              className="btn btn-primary px-8 py-3 text-base"
            >
              Apply for Membership
            </Link>

            <Link
              href="/membership/status"
              className="btn btn-outline px-8 py-3 text-base"
            >
              Check Application Status
            </Link>

            <Link
  href="/membership/update"
  className="btn btn-outline px-8 py-3"
>
  Update Existing Membership
</Link>

 {/* ✅ NEW VERIFY BUTTON */}
      <Link
        href="/membership/verify"
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Verify Membership
      </Link>
          </div>
        </div>
      </section>
    </main>
  );
}