import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // "startup" | "investor" | "admin" — selected on the login screen.
        // The requested role MUST match the role stored in the database, so a
        // startup or investor can never sign in through the admin option.
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const requestedRole = (credentials.role as string | undefined)?.trim();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        if (requestedRole && requestedRole !== user.role) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // jwt: persist user role and id into the token on first sign-in
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        let role = (user as { role?: string }).role;
        // Google sign-ins arrive without a role — resolve it from the DB so
        // role-based access control always reflects the stored account role.
        if (!role && user.email) {
          const [row] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);
          role = row?.role;
        }
        token.role = role;
      }
      return token;
    },
    // session: expose token.id and token.role on the client-visible session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
