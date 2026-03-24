import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      instagram: true,
      youtube: true,
      tiktok: true,
      twitter: true,
      _count: {
        select: { builds: true, followers: true, following: true }
      },
      builds: {
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          year: true,
          make: true,
          model: true,
          hpStock: true,
          hpTuned: true,
          totalCost: true,
          slug: true,
          _count: { select: { likes: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}
