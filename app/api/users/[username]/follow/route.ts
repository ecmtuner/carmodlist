import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const followerId = (session.user as any).id

  const targetUser = await prisma.user.findUnique({ where: { username: params.username } })
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (targetUser.id === followerId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetUser.id } }
  })

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
    return NextResponse.json({ following: false })
  } else {
    await prisma.follow.create({ data: { followerId, followingId: targetUser.id } })
    return NextResponse.json({ following: true })
  }
}
