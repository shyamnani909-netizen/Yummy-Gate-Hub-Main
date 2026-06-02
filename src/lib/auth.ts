import Credentials from "@auth/core/providers/credentials";
import type { DefaultSession } from "@auth/core/types";
import type { StartAuthJSConfig } from "start-authjs";
import { validateAuthUser } from "@/server/auth-users";

declare module "@auth/core/types" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
    };
  }
}

export const authConfig: StartAuthJSConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const user = await validateAuthUser(email, password);

        if (!user) return null;
        return user;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
};
