/**
 * Auth.js v5 Configuration
 * Configured for MongoDB with JWT strategy and 7-day token expiration
 * Uses "admin" collection for admin users only
 * Properly typed for TypeScript
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import type { AuthJWT, AuthSession, ExtendedUser } from "@/types/auth.types";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
const ADMIN_COLLECTION_NAME = process.env.ADMIN_COLLECTION_NAME!;

/**
 * Auth.js v5 Configuration
 * Uses Credentials provider with MongoDB custom queries
 * JWT strategy for stateless sessions
 */
const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const { db } = await connectToDatabase();
          const adminCollection = db.collection(ADMIN_COLLECTION_NAME);

          // Query admin user from MongoDB
          const user = await adminCollection.findOne({
            email: (credentials.email as string).toLowerCase(),
          });

          if (!user) {
            console.error("[Auth] Admin user not found:", credentials.email);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.error(
              "[Auth] Invalid password for admin:",
              credentials.email
            );
            throw new Error("Invalid credentials");
          }

          if (!user.isActive) {
            throw new Error("Admin account is inactive");
          }

          // Update last login timestamp
          await adminCollection.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          );

          // Return user object matching ExtendedUser type
          return {
            id: user._id.toString(),
            email: user.email,
            role: "admin" as const,
          } as ExtendedUser;
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * JWT Callback - Invoked when JWT is created or updated
     * Runs on sign-in and whenever session is accessed
     */
    async jwt({ token, user, trigger }) {
      // On sign-in, add custom fields to token
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.userId = extendedUser.id;
        token.email = extendedUser.email!;
        token.role = extendedUser.role;
      }

      if (trigger === "update") {
        console.log("[Auth] JWT updated via trigger");
      }

      return token as AuthJWT;
    },

    /**
     * Session Callback - Determines what is exposed to the client
     * Only expose non-sensitive data to frontend
     */
    async session({ session, token }): Promise<AuthSession> {
      const authToken = token as AuthJWT;

      return {
        ...session,
        user: {
          id: authToken.userId,
          email: authToken.email,
          role: authToken.role,
          name: session.user?.name ?? null,
          image: session.user?.image ?? null,
        } as ExtendedUser,
        accessToken: authToken.jti,
        expiresAt: authToken.exp,
      };
    },

    /**
     * Authorized Callback - Used in middleware for protected routes
     * Determines if user has access to specific paths
     */
    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const user = auth?.user as ExtendedUser | undefined;

      // Protect admin routes - only admins can access
      if (pathname.startsWith("/admin")) {
        return !!user && user.role === "admin";
      }

      return true;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: SEVEN_DAYS_IN_SECONDS, // 7 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  jwt: {
    maxAge: SEVEN_DAYS_IN_SECONDS, // 7 days
  },

  secret: process.env.AUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
