import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const userRole = request.cookies.get("user_role")?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/manager/")) {
    if (userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff/")) {
    if (userRole !== "STAFF" && userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/manager/:path*"],
};
