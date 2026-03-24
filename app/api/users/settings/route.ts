import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, username, bio, avatar, instagram, youtube, tiktok, twitter } = await req.json()
  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ error: 'Session missing user ID — please log out and back in' }, { status: 401 })

  // Check username uniqueness
  if (username) {
    const clean = username.replace(/[^a-z0-9_]/gi, '').toLowerCase()
    if (clean !== username) return NextResponse.json({ error: 'Username can only contain letters, numbers, underscores' }, { status: 400 })
    const existing = await prisma.user.findFirst({
      where: { username: clean, NOT: { id: userId } }
    })
    if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, username, bio, avatar, instagram, youtube, tiktok, twitter }
    })
    return NextResponse.json(user)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
