import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') || 'latest'
  const make = searchParams.get('make') || 'All'

  const where: any = { isPublic: true }
  if (make && make !== 'All') where.make = make

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'expensive') orderBy = { totalCost: 'desc' }

  try {
    const builds = await prisma.build.findMany({
      where,
      include: {
        user: { select: { username: true, name: true, avatar: true } },
        _count: { select: { likes: true, mods: true } }
      },
      orderBy,
      take: 50,
    })

    if (sort === 'liked') {
      builds.sort((a, b) => b._count.likes - a._count.likes)
    }

    return NextResponse.json(builds)
  } catch (err: any) {
    console.error('Discover error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
