import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string; slug: string } }
) {
  const user = await prisma.user.findUnique({ where: { username: params.username } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const build = await prisma.build.findFirst({
    where: { slug: params.slug, userId: user.id, isPublic: true },
    include: {
      mods: { orderBy: { category: 'asc' } },
      user: { select: { username: true, name: true, avatar: true } },
      _count: { select: { likes: true } }
    }
  })

  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(build)
}
