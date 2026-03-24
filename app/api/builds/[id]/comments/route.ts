import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { buildId: params.id },
    include: {
      user: { select: { name: true, username: true, avatar: true } }
    },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json(comments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'Comment must be 500 characters or less' }, { status: 400 })
  }

  // Verify build exists and is public (or belongs to commenter)
  const build = await prisma.build.findFirst({
    where: {
      id: params.id,
      OR: [
        { isPublic: true },
        { userId: (session.user as any).id }
      ]
    }
  })
  if (!build) return NextResponse.json({ error: 'Build not found' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: {
      buildId: params.id,
      userId: (session.user as any).id,
      text: text.trim(),
    },
    include: {
      user: { select: { name: true, username: true, avatar: true } }
    }
  })

  return NextResponse.json(comment)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const commentId = searchParams.get('commentId')
  if (!commentId) return NextResponse.json({ error: 'commentId required' }, { status: 400 })

  // Only delete own comment
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, buildId: params.id, userId: (session.user as any).id }
  })
  if (!comment) return NextResponse.json({ error: 'Comment not found or not yours' }, { status: 404 })

  await prisma.comment.delete({ where: { id: commentId } })
  return NextResponse.json({ success: true })
}
