import NextAuth from "next-auth"
import type { AdapterAccount } from "@auth/core/adapters"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

const adapter = PrismaAdapter(prisma)

// GitHub App user tokens expire, so GitHub also returns expires_in and
// refresh_token_expires_in. Auth.js passes every token field to linkAccount,
// and Prisma rejects the two the Account table has no columns for, which made
// the sign-in callback fail with a 500.
adapter.linkAccount = async (account: AdapterAccount) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expires_in, refresh_token_expires_in, ...data } = account as AdapterAccount & {
    expires_in?: number
    refresh_token_expires_in?: number
  }
  await prisma.account.create({ data })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  ...authConfig,
})
