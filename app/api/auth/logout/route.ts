import { NextResponse } from "next/server";

export const runtime = "nodejs";

function doLogout(req: Request) {
  const url = new URL("/admin/login?loggedOut=1", req.url);
  const response = NextResponse.redirect(url);

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function POST(req: Request) {
  return doLogout(req);
}

// ✅ add GET so visiting /api/admin/logout in browser won't 404
export async function GET(req: Request) {
  return doLogout(req);
}