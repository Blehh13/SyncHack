import type { NextAuthConfig } from 'next-auth'
import GitHub from "next-auth/providers/github"

export const authConfig = {
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    // The adapter hands us the DB user on first sign-in; persist its id and the
    // GitHub access token on the JWT so both survive subsequent requests.
    async jwt({ token, user, account }) {
      if (user) token.id = user.id
      if (account?.access_token) token.accessToken = account.access_token
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig
