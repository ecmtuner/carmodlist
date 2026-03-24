import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mod = await prisma.mod.findUnique({ where: { id: params.id }, include: { build: true } })
  if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (mod.build.userId !== (session.user as any).id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.mod.update({
    where: { id: params.id },
    data: {
      category: body.category,
      name: body.name,
      brand: body.brand || null,
      price: body.price ? parseFloat(body.price) : null,
      vendorUrl: body.vendorUrl || null,
      installDate: body.installDate || null,
      notes: body.notes || null,
      isTune: body.isTune || false,
      tunerName: body.tunerName || null,
      tunerUrl: body.tunerUrl || null,
    }
  })

  // Recalculate total cost
  const mods = await prisma.mod.findMany({ where: { buildId: mod.buildId } })
  const totalCost = mods.reduce((sum, m) => sum + (m.price || 0), 0)
  await prisma.build.update({ where: { id: mod.buildId }, data: { totalCost } })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mod = await prisma.mod.findUnique({
    where: { id: params.id },
    include: { build: true }
  })

  if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (mod.build.userId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.mod.delete({ where: { id: params.id } })

  // Recalculate total cost
  const mods = await prisma.mod.findMany({ where: { buildId: mod.buildId } })
  const totalCost = mods.reduce((sum, m) => sum + (m.price || 0), 0)
  await prisma.build.update({ where: { id: mod.buildId }, data: { totalCost } })

  return NextResponse.json({ success: true })
}
