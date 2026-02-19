# 🚀 Quick Fix: Database Connection Issue

## Problem
Prisma can't connect to PostgreSQL even though the container is running.

## ✅ Easiest Solution: Use Prisma DB Push

Instead of migrations, use `db push` for development:

```bash
cd backend
npx prisma db push
```

This will:
- ✅ Create all tables directly
- ✅ Skip migration files
- ✅ Work even with connection issues
- ⚠️ Only for development (not production)

## Alternative: Manual SQL Execution

If `db push` also fails, manually run the SQL:

1. **Copy the SQL from:** `backend/prisma/migrations/0_init/migration.sql`

2. **Execute it directly:**
   ```bash
   # Copy SQL file content
   Get-Content backend\prisma\migrations\0_init\migration.sql | docker exec -i rentguard-postgres psql -U rentguard -d rentguard_db
   ```

   Or manually:
   ```bash
   docker exec -it rentguard-postgres psql -U rentguard -d rentguard_db
   # Then paste the SQL content
   ```

## After Tables Are Created

Once tables exist, mark migrations as applied:

```bash
cd backend
npx prisma migrate resolve --applied 0_init
```

Then you can start the backend:

```bash
npm run start:dev
```

---

## Why This Happens

The authentication error is likely due to:
- Windows networking with Docker
- PostgreSQL authentication configuration
- Port binding issues

Using `db push` bypasses these issues for development.

---

**Try `npx prisma db push` first - it's the fastest solution!** 🎯
