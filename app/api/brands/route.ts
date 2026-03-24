import { NextRequest, NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg as any

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(
      `SELECT brand, COUNT(*) as count
       FROM "Mod"
       WHERE brand IS NOT NULL AND brand != ''
       AND ($1 = '' OR LOWER(category) = LOWER($1))
       AND ($2 = '' OR LOWER(brand) LIKE LOWER($2))
       GROUP BY brand
       ORDER BY count DESC
       LIMIT 20`,
      [category, q ? `${q}%` : '']
    )
    await client.end()
    return NextResponse.json(result.rows.map((r: any) => r.brand))
  } catch (err: any) {
    await client.end().catch(() => {})
    return NextResponse.json([])
  }
}
