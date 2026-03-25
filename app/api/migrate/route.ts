import { NextResponse } from 'next/server'
import pkg from 'pg'
const { Client } = pkg as any

export async function GET() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        "googleId" TEXT UNIQUE,
        name TEXT,
        username TEXT UNIQUE NOT NULL,
        avatar TEXT,
        bio TEXT,
        plan TEXT NOT NULL DEFAULT 'free',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS "Build" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"(id),
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        trim TEXT,
        "hpStock" INTEGER,
        "hpTuned" INTEGER,
        "torqueStock" INTEGER,
        "torqueTuned" INTEGER,
        fuel TEXT,
        description TEXT,
        "coverImage" TEXT,
        "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
        "totalCost" FLOAT NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS "Mod" (
        id TEXT PRIMARY KEY,
        "buildId" TEXT NOT NULL REFERENCES "Build"(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        brand TEXT,
        "vendorUrl" TEXT,
        price FLOAT,
        "installDate" TEXT,
        notes TEXT,
        "isTune" BOOLEAN NOT NULL DEFAULT FALSE,
        "tunerName" TEXT,
        "tunerUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS "Like" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"(id),
        "buildId" TEXT NOT NULL REFERENCES "Build"(id) ON DELETE CASCADE,
        UNIQUE("userId", "buildId")
      );
      CREATE TABLE IF NOT EXISTS "Follow" (
        id TEXT PRIMARY KEY,
        "followerId" TEXT NOT NULL REFERENCES "User"(id),
        "followingId" TEXT NOT NULL REFERENCES "User"(id),
        UNIQUE("followerId", "followingId")
      );
      CREATE TABLE IF NOT EXISTS "BuildPhoto" (
        id TEXT PRIMARY KEY,
        "buildId" TEXT NOT NULL REFERENCES "Build"(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        "publicId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS "Comment" (
        id TEXT PRIMARY KEY,
        "buildId" TEXT NOT NULL REFERENCES "Build"(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "User"(id),
        text TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    // Add social media columns if not present
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS instagram TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS youtube TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS tiktok TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS twitter TEXT;
    `)
    // Add youtubeUrl to Build
    await client.query(`
      ALTER TABLE "Build" ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
    `)
    await client.end()
    return NextResponse.json({ ok: true, message: 'Tables created successfully' })
  } catch (err: any) {
    await client.end().catch(() => {})
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
