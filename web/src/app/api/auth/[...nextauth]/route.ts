import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          hd: "*", // Allow any Google Workspace domain
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Extract domain from email
      const email = user.email;
      if (!email) return false;
      
      const domain = email.split("@")[1];
      
      // Store domain info in token for later use
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user?.email) {
        token.domain = user.email.split("@")[1];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).domain = token.domain;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
