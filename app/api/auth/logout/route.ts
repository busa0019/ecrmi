import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL("/admin/login?loggedOut=1", req.url);

  const response = NextResponse.redirect(url);

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}