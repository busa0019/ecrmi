"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function HeaderActions() {
  const [hasSession, setHasSession] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    setHasSession(!!email);
  }, []);

  return (
    <>
      {/* ===== DESKTOP (UNCHANGED BEHAVIOR) ===== */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/courses"
          className="text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          Courses
        </Link>

        <Link
          href="/verify"
          className="text-sm font-medium text-gray-600 hover:text-blue-600"
        >
          Verify Certificate
        </Link>

        {hasSession ? (
          <Link
            href="/profile"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Edit Profile
          </Link>
        ) : (
          <Link href="/start" className="btn btn-primary">
            Get Started
          </Link>
        )}
      </div>

      {/* ===== MOBILE HAMBURGER ===== */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white border-t shadow-lg md:hidden z-50">
          <nav className="flex flex-col divide-y text-sm">
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="px-6 py-4 hover:bg-gray-50"
            >
              Courses
            </Link>

            <Link
              href="/verify"
              onClick={() => setOpen(false)}
              className="px-6 py-4 hover:bg-gray-50"
            >
              Verify Certificate
            </Link>

            {hasSession ? (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-6 py-4 text-blue-600 font-medium hover:bg-gray-50"
              >
                Edit Profile
              </Link>
            ) : (
              <Link
                href="/start"
                onClick={() => setOpen(false)}
                className="px-6 py-4 font-semibold text-blue-600 hover:bg-gray-50"
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}