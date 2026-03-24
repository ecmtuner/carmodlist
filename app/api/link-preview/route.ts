import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ image: null, title: null, description: null })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ image: null, title: null, description: null })
    }

    const html = await res.text()

    const ogImage =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1] ||
      null

    const ogTitle =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i)?.[1] ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      null

    const ogDescription =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i)?.[1] ||
      html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)?.[1] ||
      null

    // Try to extract price from common e-commerce patterns
    const priceMatch =
      html.match(/"price"\s*:\s*"?([\d,]+\.?\d*)"?/i)?.[1] ||
      html.match(/itemprop="price"[^>]+content="([\d.]+)"/i)?.[1] ||
      html.match(/class="[^"]*price[^"]*"[^>]*>\s*\$?([\d,]+\.?\d*)/i)?.[1] ||
      html.match(/<meta[^>]+property="product:price:amount"[^>]+content="([\d.]+)"/i)?.[1] ||
      null

    const price = priceMatch ? parseFloat(priceMatch.replace(/,/g, '')) : null

    return NextResponse.json({
      image: ogImage ? ogImage.trim() : null,
      title: ogTitle ? ogTitle.trim() : null,
      description: ogDescription ? ogDescription.trim() : null,
      price: price && price > 0 && price < 100000 ? price : null,
    })
  } catch {
    return NextResponse.json({ image: null, title: null, description: null })
  }
}
