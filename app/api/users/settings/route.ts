import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, username, bio, avatar } = await req.json()
  const userId = (session.user as any).id

  // Check username uniqueness
  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } }
    })
    if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, username, bio, avatar }
  })

  return NextResponse.json(user)
}
