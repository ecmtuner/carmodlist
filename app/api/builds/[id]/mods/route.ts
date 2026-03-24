import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify build belongs to user
  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id }
  })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await req.json()
  const isTune = data.category === 'Tune'

  const mod = await prisma.mod.create({
    data: {
      buildId: params.id,
      category: data.category,
      name: data.name,
      brand: data.brand,
      vendorUrl: data.vendorUrl,
      price: data.price ? parseFloat(data.price) : null,
      installDate: data.installDate,
      notes: data.notes,
      isTune,
      tunerName: isTune ? data.tunerName : null,
      tunerUrl: isTune ? data.tunerUrl : null,
    }
  })

  // Recalculate total cost
  const mods = await prisma.mod.findMany({ where: { buildId: params.id } })
  const totalCost = mods.reduce((sum, m) => sum + (m.price || 0), 0)
  await prisma.build.update({ where: { id: params.id }, data: { totalCost } })

  return NextResponse.json(mod)
}
