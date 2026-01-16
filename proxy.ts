import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const userRole = session?.user
    ? (session.user as { role?: string }).role
    : undefined;

  if (pathname.startsWith("/admin")) {
    if (!session?.user || userRole !== "admin") {
      return Response.redirect(new URL("/login", req.url));
    }
  }

  if (
    (pathname === "/login" || pathname === "/create-account") &&
    session?.user
  ) {
    return Response.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
