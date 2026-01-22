"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";

export default function AdminTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <h2 className="text-lg font-semibold">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900"
          >
            View Site
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button className="text-red-600 hover:underline">
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* ✅ MOBILE SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="bg-white w-64 h-full shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
}