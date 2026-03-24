import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString(36)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const builds = await prisma.build.findMany({
    where: { userId: (session.user as any).id },
    include: {
      mods: true,
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(builds)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const slug = slugify(data.title)

  const build = await prisma.build.create({
    data: {
      userId: (session.user as any).id,
      slug,
      title: data.title,
      year: parseInt(data.year),
      make: data.make,
      model: data.model,
      trim: data.trim,
      hpStock: data.hpStock ? parseInt(data.hpStock) : null,
      hpTuned: data.hpTuned ? parseInt(data.hpTuned) : null,
      torqueStock: data.torqueStock ? parseInt(data.torqueStock) : null,
      torqueTuned: data.torqueTuned ? parseInt(data.torqueTuned) : null,
      fuel: data.fuel,
      description: data.description,
    }
  })

  return NextResponse.json(build)
}
