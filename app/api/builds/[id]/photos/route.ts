import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the build belongs to this user
  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
    include: { _count: { select: { photos: true } } }
  })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Max 10 photos
  if ((build as any)._count.photos >= 10) {
    return NextResponse.json({ error: 'Maximum 10 photos per build' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  try {
    let uploadUrl: string
    let uploadBody: FormData

    if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET && CLOUDINARY_CLOUD_NAME) {
      // Signed upload
      const timestamp = Math.round(Date.now() / 1000)
      const paramsToSign = `timestamp=${timestamp}`

      // Generate SHA1 signature
      const crypto = await import('crypto')
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + CLOUDINARY_API_SECRET)
        .digest('hex')

      uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      uploadBody = new FormData()
      uploadBody.append('file', file)
      uploadBody.append('api_key', CLOUDINARY_API_KEY)
      uploadBody.append('timestamp', String(timestamp))
      uploadBody.append('signature', signature)
    } else if (CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
      // Unsigned upload with preset
      uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      uploadBody = new FormData()
      uploadBody.append('file', file)
      uploadBody.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)
    } else {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    const cloudRes = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadBody,
    })

    if (!cloudRes.ok) {
      const err = await cloudRes.text()
      return NextResponse.json({ error: 'Cloudinary upload failed', details: err }, { status: 500 })
    }

    const cloudData = await cloudRes.json()
    const { secure_url, public_id } = cloudData

    // Get current photo count for order
    const photoCount = (build as any)._count.photos

    const photo = await prisma.buildPhoto.create({
      data: {
        buildId: params.id,
        url: secure_url,
        publicId: public_id,
        order: photoCount,
      }
    })

    // If this is the first photo and no cover image, set it as cover
    if (photoCount === 0 && !build.coverImage) {
      await prisma.build.update({
        where: { id: params.id },
        data: { coverImage: secure_url }
      })
    }

    return NextResponse.json(photo)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify build belongs to user
  const build = await prisma.build.findFirst({
    where: { id: params.id, userId: (session.user as any).id }
  })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const photoId = searchParams.get('photoId')
  if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 })

  const photo = await prisma.buildPhoto.findFirst({
    where: { id: photoId, buildId: params.id }
  })
  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  // Delete from Cloudinary if configured
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    try {
      const crypto = await import('crypto')
      const timestamp = Math.round(Date.now() / 1000)
      const paramsToSign = `public_id=${photo.publicId}&timestamp=${timestamp}`
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + CLOUDINARY_API_SECRET)
        .digest('hex')

      const deleteBody = new FormData()
      deleteBody.append('public_id', photo.publicId)
      deleteBody.append('api_key', CLOUDINARY_API_KEY)
      deleteBody.append('timestamp', String(timestamp))
      deleteBody.append('signature', signature)

      await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: 'POST',
        body: deleteBody,
      })
    } catch {
      // Non-fatal — continue deleting from DB
    }
  }

  await prisma.buildPhoto.delete({ where: { id: photoId } })

  // If deleted photo was the cover image, update to first remaining photo
  if (build.coverImage === photo.url) {
    const firstPhoto = await prisma.buildPhoto.findFirst({
      where: { buildId: params.id },
      orderBy: { order: 'asc' }
    })
    await prisma.build.update({
      where: { id: params.id },
      data: { coverImage: firstPhoto?.url ?? null }
    })
  }

  return NextResponse.json({ success: true })
}
