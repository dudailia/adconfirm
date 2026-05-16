import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect advertiser routes
  if (
    pathname.startsWith("/advertiser/dashboard") ||
    pathname.startsWith("/advertiser/campaigns")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/advertiser/login", request.url));
    }
  }

  // Redirect authenticated users away from login pages
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/advertiser/login" && user) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/advertiser/dashboard/:path*",
    "/advertiser/campaigns/:path*",
    "/login",
    "/advertiser/login",
  ],
};
