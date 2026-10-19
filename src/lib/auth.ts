import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { User } from "../../models/user.model";

import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) {
          return false;
        }

        await connectDB();
        const cookieStore = await cookies();
        const pendingCookie = cookieStore.get("pending_admin_username")?.value;
        const pendingUsername = pendingCookie ? decodeURIComponent(pendingCookie) : null;

        const email = user.email.toLowerCase();
        let existingUser = await User.findOne({ email });

        if (!existingUser) {
          let chosenUsername = pendingUsername;
          if (!chosenUsername) {
            // Generate clean unique username from user.name or email prefix
            const rawBase = (user.name || email.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "_")
              .replace(/^_+|_+$/g, "")
              .slice(0, 14);
            const baseUsername = rawBase.length >= 3 ? rawBase : "admin";

            let candidate = baseUsername;
            let counter = 1;
            while (await User.findOne({ username: candidate })) {
              candidate = `${baseUsername.slice(0, 12)}_${Math.floor(100 + Math.random() * 900)}`;
              counter++;
              if (counter > 10) break;
            }
            chosenUsername = candidate;
          }

          // Create new user using username from form or derived, and verified email from Google OAuth
          existingUser = await User.create({
            username: chosenUsername,
            email,
            role: "subadmin", // Default role per models/user.model.ts
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (pendingUsername && existingUser.username !== pendingUsername) {
          // Update username if a new one was submitted
          existingUser.username = pendingUsername;
          existingUser.updatedAt = new Date();
          await existingUser.save();
        }

        return true;
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.verified = dbUser.verified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.username = token.username as string | undefined;
        session.user.role = token.role as "admin" | "subadmin" | "editor" | undefined;
        session.user.verified = token.verified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_admin_secret_key_tunedin_spotify",
};
