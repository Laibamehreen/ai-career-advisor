export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment/:path*",
    "/careers/:path*",
    "/roadmap/:path*",
    "/resume/:path*",
    "/chat/:path*",
    "/admin/:path*",
  ],
};
