import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";

export default function EntryDecisionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="relative max-w-3xl w-full bg-white/90 backdrop-blur border rounded-3xl p-10 shadow-xl">
        <div className="absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-3xl" />

        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">
          Welcome to ECRMI
        </h1>

        <p className="text-gray-600 text-base sm:text-lg mb-10 text-center">
          Please select what you would like to do today
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            href="/training"
            className="group rounded-2xl border bg-white p-6 hover:shadow-2xl transition"
          >
            <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-center">
              Training & Exams
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Access professional courses, CBT exams, and QR‑verified certificates.
            </p>
          </Link>

          <Link
            href="/membership"
            className="group rounded-2xl border bg-white p-6 hover:shadow-2xl transition"
          >
            <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-center">
              Membership
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Apply for professional membership and official recognition.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}