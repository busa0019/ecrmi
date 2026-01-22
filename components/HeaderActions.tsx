"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderActions() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem("participantEmail");
    setHasSession(!!email);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* ✅ ALWAYS VISIBLE */}
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
        <>
          <Link
            href="/profile"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Edit Profile
          </Link>
        </>
      ) : (
        <Link href="/start" className="btn btn-primary">
          Get Started
        </Link>
      )}
    </div>
  );
}