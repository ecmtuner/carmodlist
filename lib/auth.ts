import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, username: user.username } as any
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } })
        if (!existing) {
          const username = user.email!.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + Math.floor(Math.random() * 999)
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              googleId: account.providerAccountId,
              username,
              avatar: user.image
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id
        token.username = (user as any).username
      }
      // Always refresh from DB so username changes take effect immediately
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.name = dbUser.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).username = token.username
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: { signIn: '/login' }
}
