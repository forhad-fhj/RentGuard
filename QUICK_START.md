# 🚀 RentGuard Quick Start Guide

## What You Need to Do - Step by Step

### ✅ STEP 1: Install Prerequisites

**Required:**
- [ ] Node.js 20+ ([Download](https://nodejs.org/))
- [ ] Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))
- [ ] Git (if cloning from repo)

**Verify Installation:**
```bash
node --version    # Should be v20.x.x or higher
docker --version  # Should be installed
npm --version     # Should be installed with Node.js
```

---

### ✅ STEP 2: Setup Environment Files

**2.1 Create Backend Environment File:**
```bash
cd backend
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux
```

**2.2 Edit `backend/.env` - MINIMUM REQUIRED:**

You MUST change these (use strong random strings):
```env
# ⚠️ CHANGE THESE - Generate random strings
JWT_SECRET=your-random-32-char-secret-key-here-minimum
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret-here
ENCRYPTION_KEY=your-random-32-character-encryption-key

# Database (can use defaults for local dev)
DATABASE_URL=postgresql://rentguard:changeme@localhost:5432/rentguard_db?schema=public

# Redis (can use defaults)
REDIS_URL=redis://localhost:6379
```

**Optional for Initial Setup (can skip for now):**
- AWS S3 credentials (for file uploads - can add later)
- Email SMTP (for notifications - can add later)
- SMS Twilio (for OTP - can add later)
- Payment gateways (bKash/Nagad - can add later)

**2.3 Create Frontend Environment File:**
```bash
cd frontend
copy .env.example .env.local    # Windows
# OR
cp .env.example .env.local     # Mac/Linux
```

**2.4 Edit `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

### ✅ STEP 3: Start Infrastructure Services

**Start PostgreSQL and Redis using Docker:**

```bash
# From project root directory
docker-compose up -d postgres redis
```

**Verify services are running:**
```bash
docker ps
# You should see:
# - rentguard-postgres (port 5432)
# - rentguard-redis (port 6379)
```

**Optional (can skip for now):**
- Kafka & Zookeeper (for event-driven features - not required initially)

---

### ✅ STEP 4: Setup Backend

**4.1 Install Dependencies:**
```bash
cd backend
npm install
```

**4.2 Generate Prisma Client:**
```bash
npm run prisma:generate
```

**4.3 Run Database Migrations:**
```bash
npm run migration:run
```

This creates all database tables.

**4.4 Start Backend Server:**
```bash
npm run start:dev
```

**✅ Backend should now be running at:** `http://localhost:3001`
**✅ API Docs available at:** `http://localhost:3001/api/docs`

---

### ✅ STEP 5: Setup Frontend

**5.1 Install Dependencies:**
```bash
cd frontend
npm install
```

**5.2 Start Frontend Server:**
```bash
npm run dev
```

**✅ Frontend should now be running at:** `http://localhost:3000`

---

## 🎉 You're Done! What's Next?

1. **Test the API:**
   - Visit: http://localhost:3001/api/docs
   - Try registering a user: `POST /auth/register`

2. **Test the Frontend:**
   - Visit: http://localhost:3000
   - You should see the RentGuard landing page

3. **Create Your First User:**
   ```bash
   # Using API docs or curl:
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "phone": "+8801712345678",
       "password": "Test123!@#",
       "role": "TENANT"
     }'
   ```

---

## 📋 Configuration Checklist

### ✅ Required (Must Configure)
- [ ] `JWT_SECRET` - Generate random 32+ character string
- [ ] `JWT_REFRESH_SECRET` - Generate random 32+ character string  
- [ ] `ENCRYPTION_KEY` - Generate random 32 character string
- [ ] Database running (PostgreSQL via Docker)
- [ ] Redis running (via Docker)

### ⚠️ Important (Should Configure Soon)
- [ ] AWS S3 credentials (for file uploads)
- [ ] Email SMTP settings (for notifications)
- [ ] Admin account credentials

### 🔄 Optional (Can Add Later)
- [ ] Kafka (for event-driven features)
- [ ] SMS Twilio (for OTP)
- [ ] Payment gateways (bKash/Nagad)
- [ ] Sentry (for error tracking)
- [ ] Monitoring (Prometheus/Grafana)

---

## 🔧 Generate Secure Keys

**Quick way to generate secure keys:**

**Windows (PowerShell):**
```powershell
# Generate JWT Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Generate Encryption Key
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Mac/Linux:**
```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Encryption Key
openssl rand -hex 16
```

**Or use online tool:** https://randomkeygen.com/

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs rentguard-postgres

# Restart if needed
docker-compose restart postgres
```

### Port Already in Use
```bash
# Check what's using port 3001
netstat -ano | findstr :3001    # Windows
lsof -i :3001                    # Mac/Linux

# Change port in backend/.env:
PORT=3002
```

### Prisma Migration Failed
```bash
cd backend
# Reset database (⚠️ deletes all data)
npm run migration:reset

# Or manually fix and retry
npm run migration:run
```

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 What to Provide Me If You Need Help

If you encounter issues, provide:

1. **Error messages** (full stack trace)
2. **What step you're on** (Step 1-5)
3. **Environment info:**
   ```bash
   node --version
   docker --version
   npm --version
   ```
4. **Service status:**
   ```bash
   docker ps
   ```
5. **Backend logs:**
   ```bash
   cd backend
   npm run start:dev
   # Copy the error output
   ```

---

## 🎯 Next Steps After Setup

1. **Create Admin User** (via API or seed script)
2. **Configure AWS S3** (for document storage)
3. **Set up Email** (for notifications)
4. **Test Identity Verification** (upload NID + selfie)
5. **Create Test Properties** (for testing)
6. **Build Frontend UI** (authentication pages, dashboards)

---

## 💡 Pro Tips

- **Use Docker Compose** for all infrastructure (easier than installing locally)
- **Keep `.env` files secure** - never commit them to git
- **Start with minimal config** - add features gradually
- **Use Prisma Studio** to view database: `cd backend && npm run prisma:studio`
- **Check API docs** at `/api/docs` for all available endpoints

---

**Ready to start? Follow Steps 1-5 above!** 🚀
