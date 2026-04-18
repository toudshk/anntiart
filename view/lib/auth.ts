import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AdminClaims = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

const ADMIN_ID = "admin";

async function authorizeAdmin(
  email: string,
  password: string,
): Promise<AdminClaims | null> {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || !configuredHash) return null;
  if (email.toLowerCase() !== configuredEmail.toLowerCase()) return null;

  const isValid = await bcrypt.compare(password, configuredHash);
  if (!isValid) return null;

  return {
    id: ADMIN_ID,
    name: "Anntiart Admin",
    email: configuredEmail,
    role: "admin",
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;
        return authorizeAdmin(email, password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role === "admin" ? "admin" : "viewer";
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};
