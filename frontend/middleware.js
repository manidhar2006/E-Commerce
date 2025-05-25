import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); // Read the authentication token
  console.log("Token:", token);
  const { pathname } = req.nextUrl;
  console.log("Pathname:", pathname);
  if (!token) {
    // If user is NOT authenticated, redirect to login page
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    // If user is authenticated, redirect from login page to products page
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  return NextResponse.next(); // Continue to the requested page
}

export const config = {
  matcher: ["/", "/login", "/products", "/profile"], // Apply middleware to these paths
};
