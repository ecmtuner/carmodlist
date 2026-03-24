import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      // Fallback: convert to base64 data URL if Cloudinary not configured
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = file.type || 'image/jpeg'
      return NextResponse.json({ url: `data:${mimeType};base64,${base64}` })
    }

    // Upload to Cloudinary
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', 'carmodlist_avatars')
    uploadData.append('folder', 'carmodlist/avatars')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    })

    const data = await res.json()
    if (data.secure_url) {
      return NextResponse.json({ url: data.secure_url })
    }
    return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 500 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
