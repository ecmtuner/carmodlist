import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
    include: { mods: { orderBy: { category: 'asc' } }, _count: { select: { likes: true } } }
  })

  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(build)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id }
  })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.build.update({
    where: { id: params.id },
    data: {
      title: data.title,
      year: data.year ? parseInt(data.year) : undefined,
      make: data.make,
      model: data.model,
      trim: data.trim,
      hpStock: data.hpStock ? parseInt(data.hpStock) : null,
      hpTuned: data.hpTuned ? parseInt(data.hpTuned) : null,
      torqueStock: data.torqueStock ? parseInt(data.torqueStock) : null,
      torqueTuned: data.torqueTuned ? parseInt(data.torqueTuned) : null,
      fuel: data.fuel,
      description: data.description,
      isPublic: data.isPublic,
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id }
  })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.build.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
