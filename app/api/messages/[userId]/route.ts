import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/[userId] — full thread, marks received as read
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const currentUserId = (session.user as any).id as string
  const { userId: otherUserId } = await params

  // Fetch thread
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    },
    include: {
      sender: { select: { id: true, username: true, name: true, avatar: true } },
      receiver: { select: { id: true, username: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark all unread messages sent to current user as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: currentUserId,
      read: false,
    },
    data: { read: true },
  })

  // Fetch the other user's profile
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, username: true, name: true, avatar: true },
  })

  return NextResponse.json({ messages, otherUser })
}

// POST /api/messages/[userId] — send message to [userId]
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const currentUserId = (session.user as any).id as string
  const { userId: receiverId } = await params

  const { text } = await req.json()
  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }
  if (receiverId === currentUserId) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      senderId: currentUserId,
      receiverId,
      text: text.trim(),
    },
    include: {
      sender: { select: { id: true, username: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json(message)
}
