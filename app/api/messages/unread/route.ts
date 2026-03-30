import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/unread — total unread count for current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ count: 0 })
  const userId = (session.user as any).id as string

  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      read: false,
    },
  })

  return NextResponse.json({ count })
}
