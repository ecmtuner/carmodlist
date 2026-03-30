import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages — returns all conversations for current user grouped by the other person
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string

  // Get all messages involving current user
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, username: true, name: true, avatar: true } },
      receiver: { select: { id: true, username: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by the other person
  const conversationsMap = new Map<string, {
    user: { id: string; username: string; name?: string | null; avatar?: string | null }
    lastMessage: { text: string; createdAt: Date; senderId: string }
    unreadCount: number
  }>()

  for (const msg of messages) {
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender
    const otherId = otherUser.id

    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, {
        user: otherUser,
        lastMessage: { text: msg.text, createdAt: msg.createdAt, senderId: msg.senderId },
        unreadCount: 0,
      })
    }

    // Count unread messages sent to current user
    if (msg.receiverId === userId && !msg.read) {
      const conv = conversationsMap.get(otherId)!
      conv.unreadCount += 1
    }
  }

  const conversations = Array.from(conversationsMap.values())
  return NextResponse.json(conversations)
}

// POST /api/messages — send a message { receiverId, text }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string

  const { receiverId, text } = await req.json()
  if (!receiverId || !text?.trim()) {
    return NextResponse.json({ error: 'receiverId and text required' }, { status: 400 })
  }
  if (receiverId === userId) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      text: text.trim(),
    },
    include: {
      sender: { select: { id: true, username: true, name: true, avatar: true } },
      receiver: { select: { id: true, username: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json(message)
}
