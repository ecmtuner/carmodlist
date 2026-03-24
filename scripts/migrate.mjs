import pkg from 'pg';
const { Client } = pkg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await client.connect();
  console.log('Running migrations...');

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
  `);

  console.log('✅ Migration complete');
  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
