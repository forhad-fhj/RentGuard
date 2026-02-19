# Apply Database Migration - Step by Step

## Problem
Prisma can't connect to PostgreSQL from the host machine due to authentication issues.

## Solution: Apply SQL Directly to Container

Since we can connect from inside the container, we'll apply the SQL directly.

### Step 1: Apply Migration SQL

**Option A: Using PowerShell Script (Easiest)**
```powershell
.\scripts\apply-migration.ps1
```

**Option B: Manual Command**
```powershell
Get-Content backend\prisma\migrations\0_init\migration.sql | docker exec -i rentguard-postgres psql -U rentguard -d rentguard_db
```

**Option C: Copy-Paste Method**
1. Open `backend\prisma\migrations\0_init\migration.sql`
2. Copy all content
3. Run:
   ```powershell
   docker exec -it rentguard-postgres psql -U rentguard -d rentguard_db
   ```
4. Paste the SQL content
5. Press Enter
6. Type `\q` to exit

### Step 2: Mark Migration as Applied

After SQL is applied, tell Prisma the migration is done:

```powershell
cd backend
npx prisma migrate resolve --applied 0_init
```

### Step 3: Verify Tables Created

```powershell
docker exec rentguard-postgres psql -U rentguard -d rentguard_db -c "\dt"
```

You should see all tables listed.

### Step 4: Start Backend

```powershell
cd backend
npm run start:dev
```

---

## Alternative: Fix Connection Issue

If you want to fix the connection issue instead:

### Try Different Connection String

Edit `backend/.env`:

```env
# Try 127.0.0.1 instead of localhost
DATABASE_URL=postgresql://rentguard:changeme@127.0.0.1:5432/rentguard_db?schema=public
```

### Check PostgreSQL Configuration

The container might not be accepting external connections. Check:

```powershell
docker exec rentguard-postgres cat /var/lib/postgresql/data/pg_hba.conf
```

Look for lines like:
```
host    all             all             0.0.0.0/0               md5
```

If missing, PostgreSQL won't accept external connections.

---

## Quick Test

Test if you can connect from host:

```powershell
# This should work if connection is configured correctly
psql -h localhost -U rentguard -d rentguard_db
# Password: changeme
```

If this fails, the container isn't accepting external connections, so use the direct SQL method above.

---

**Recommended: Use the PowerShell script - it's the fastest!** 🚀
