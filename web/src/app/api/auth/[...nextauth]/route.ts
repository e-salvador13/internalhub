import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyMagicToken, getOrCreateUser } from "@/lib/supabase";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        // Verify the magic token
        const result = await verifyMagicToken(credentials.token);
        if (!result) {
          return null;
        }

        // Get or create user
        const user = await getOrCreateUser(result.email);
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
