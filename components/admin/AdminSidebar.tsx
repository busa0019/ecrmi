"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  BarChart2,
  Award,
  Settings,
  Users,
  KeyRound,
} from "lucide-react";
import clsx from "clsx";

type NavItem = {
  label: string;
  path: string;
  icon: any;
};

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },

  { label: "Courses", path: "/admin/courses", icon: BookOpen },
  { label: "Attempts", path: "/admin/attempts", icon: FileCheck },
  { label: "Certificates", path: "/admin/certificates", icon: Award },

  { label: "Training Codes", path: "/admin/training-codes", icon: KeyRound },

  { label: "Analytics", path: "/admin/analytics", icon: BarChart2 },
  { label: "Memberships", path: "/admin/memberships", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen px-3 py-6">
      {/* Logo */}
      <div className="mb-10 px-3">
        <h1 className="text-xl font-bold text-[#0F172A]">
          ECRMI <span className="text-teal-600">Admin</span>
        </h1>
        <p className="text-xs text-slate-500">Training Platform</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = pathname === path;

          return (
            <button
              key={path}
              onClick={() => router.push(path as any)}
              className={clsx(
                "relative w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {/* ✅ Animated active indicator */}
              <span
                className={clsx(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r transition-all duration-200",
                  active ? "bg-teal-600" : "bg-transparent"
                )}
              />

              <Icon
                className={clsx(
                  "w-5 h-5 transition-colors duration-200",
                  active ? "text-teal-600" : "text-slate-500"
                )}
              />

              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}