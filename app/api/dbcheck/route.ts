export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg as any

export async function GET() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const res = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'Build' ORDER BY column_name
  `)
  await client.end()
  return NextResponse.json({ columns: res.rows.map((r: any) => r.column_name) })
}
