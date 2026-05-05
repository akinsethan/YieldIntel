import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const USERS = [
  { id:"1", name:"J. Akins", email:"advisor@yieldintel.com", password:"advisor123", role:"advisor" },
  { id:"2", name:"Assistant", email:"assistant@yieldintel.com", password:"assistant123", role:"assistant" },
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label:"Email",    type:"email" },
        password: { label:"Password", type:"password" },
        role:     { label:"Role",     type:"text" },
      },
      async authorize(credentials) {
        const user = USERS.find(u =>
          u.email    === credentials?.email &&
          u.password === credentials?.password &&
          u.role     === credentials?.role
        );
        if (user) return { id: user.id, name: user.name, email: user.email, role: user.role };
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as unknown as { role: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role: string }).role = token.role as string;
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? "yieldintel-super-secret-key-2026",
});

export { handler as GET, handler as POST };