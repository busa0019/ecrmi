import Link from "next/link";
import {
  Award,
  BarChart3,
  Globe,
  ShieldCheck,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle,
  UserPlus,
  FileText,
  BadgeCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-white">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white" />
        <div className="absolute top-24 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl hidden sm:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Transform Your <br />
              <span className="text-blue-600">Career Today</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              Emergency, Crisis & Disaster Risk Management Institute delivers
              professional training and QR‑verified certification trusted by
              employers and institutions.
            </p>

            {/* CTA BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/start"
                className="btn btn-primary inline-flex items-center gap-2 justify-center"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/courses"
                className="btn btn-outline justify-center"
              >
                View Courses
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
              <Stat value="50K+" label="Professionals Trained" />
              <Stat value="98%" label="Success Rate" />
              <Stat value="100+" label="Programs" />
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <HeroCard
                icon={<Award />}
                color="bg-green-600"
                title="Certificate Earned"
                subtitle="QR‑Verified Credential"
              />
              <HeroCard
                icon={<BarChart3 />}
                color="bg-blue-600"
                title="Progress Tracking"
                subtitle="Assessment Performance"
                right="+15%"
              />
              <HeroCard
                icon={<Globe />}
                color="bg-indigo-600"
                title="Global Recognition"
                subtitle="Employer Validation"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A complete training and certification ecosystem
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <Feature icon={<BookOpen />} color="bg-blue-600" title="Expert‑Led Training" />
            <Feature icon={<Award />} color="bg-green-600" title="Verified Certificates" />
            <Feature icon={<Clock />} color="bg-indigo-600" title="Flexible Learning" />
            <Feature icon={<ShieldCheck />} color="bg-amber-500" title="Enterprise Security" />
            <Feature icon={<BarChart3 />} color="bg-teal-600" title="Advanced Analytics" />
            <Feature icon={<Globe />} color="bg-rose-500" title="Global Recognition" />
          </div>
        </div>
      </section>

      {/* ===== JOURNEY ===== */}
      <section className="py-20 sm:py-28 bg-white relative">
        <div className="hidden md:block absolute top-1/2 left-1/2 w-[70%] h-px bg-gray-200 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-16">
            Your Journey to Certification
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <JourneyStep icon={<UserPlus />} title="Enroll" />
            <JourneyStep icon={<FileText />} title="Complete Training" />
            <JourneyStep icon={<BadgeCheck />} title="Earn Certificate" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[#0B1220] py-20 sm:py-24 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Advance Your Career?
        </h2>
        <p className="text-slate-300 mb-8">
          Start your professional journey with ECRMI today.
        </p>

        <Link
          href="/courses"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          Start Learning
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm text-slate-400">
          <span className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4" /> No credit card required
          </span>
          <span className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4" /> Start instantly
          </span>
        </div>
      </section>
    </main>
  );
}

/* ===== COMPONENTS ===== */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-blue-600">
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function Feature({ icon, title, color }: any) {
  return (
    <div className="p-8 bg-white rounded-2xl border hover:shadow-xl transition">
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">
        Designed to meet professional and regulatory standards.
      </p>
    </div>
  );
}

function JourneyStep({ icon, title }: any) {
  return (
    <div className="p-8 bg-slate-50 rounded-2xl shadow-sm">
      <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
  );
}

function HeroCard({ icon, title, subtitle, right, color }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
      <div className={`w-10 h-10 ${color} text-white rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
      {right && <div className="text-blue-600 font-bold">{right}</div>}
    </div>
  );
}