import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import {
  findUserByEmail,
  upsertGoogleUser,
  verifyPassword,
} from "@/lib/users-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(email);
        if (!user) {
          return null;
        }

        const valid = await verifyPassword(user, password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email =
          user.email ??
          (typeof profile?.email === "string" ? profile.email : null);
        const googleId =
          (typeof profile?.sub === "string" ? profile.sub : null) ?? user.id;

        if (!email || !googleId) {
          return false;
        }

        try {
          await upsertGoogleUser({
            id: googleId,
            email,
            name: user.name,
          });
        } catch (error) {
          // Keep Google login working even if the users table is unavailable.
          console.error("Failed to upsert Google user:", error);
        }
      }
      return true;
    },
    jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile) {
        token.sub = (profile.sub as string | undefined) ?? token.sub;
      } else if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
