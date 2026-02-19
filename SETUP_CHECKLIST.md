# ✅ RentGuard Setup Checklist

## 🎯 Quick Reference - What You Need to Do

### Step 1: Install Prerequisites ⏱️ 5 minutes
- [ ] Install Node.js 20+ → https://nodejs.org/
- [ ] Install Docker Desktop → https://www.docker.com/products/docker-desktop/
- [ ] Verify: `node --version` and `docker --version`

### Step 2: Generate Secrets ⏱️ 2 minutes
```bash
# Run this from project root:
node scripts/generate-secrets.js

# Copy the generated secrets to backend/.env
```

### Step 3: Configure Environment Files ⏱️ 3 minutes
- [ ] Copy `backend/.env.example` → `backend/.env`
- [ ] Copy `frontend/.env.example` → `frontend/.env.local`
- [ ] Update `backend/.env` with generated secrets (from Step 2)
- [ ] Verify `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`

### Step 4: Start Infrastructure ⏱️ 2 minutes
```bash
docker-compose up -d postgres redis
```

**Verify:**
```bash
docker ps
# Should see: rentguard-postgres and rentguard-redis
```

### Step 5: Setup Backend ⏱️ 5 minutes
```bash
cd backend
npm install
npm run prisma:generate
npm run migration:run
npm run start:dev
```

**✅ Backend running:** http://localhost:3001  
**✅ API Docs:** http://localhost:3001/api/docs

### Step 6: Setup Frontend ⏱️ 3 minutes
```bash
cd frontend
npm install
npm run dev
```

**✅ Frontend running:** http://localhost:3000

---

## 📋 Configuration Checklist

### 🔴 Required (Must Configure)
- [ ] `JWT_SECRET` - 32+ character random string
- [ ] `JWT_REFRESH_SECRET` - 32+ character random string
- [ ] `ENCRYPTION_KEY` - 32 character random string
- [ ] PostgreSQL running (via Docker)
- [ ] Redis running (via Docker)

### 🟡 Important (Should Configure Soon)
- [ ] AWS S3 credentials (for file uploads)
- [ ] Email SMTP (for notifications)
- [ ] Admin account setup

### 🟢 Optional (Can Add Later)
- [ ] Kafka (event-driven features)
- [ ] Twilio SMS (OTP)
- [ ] Payment gateways (bKash/Nagad)
- [ ] Sentry (error tracking)
- [ ] Monitoring tools

---

## 🚀 Quick Commands Reference

### Generate Secrets
```bash
node scripts/generate-secrets.js
```

### Start Infrastructure
```bash
docker-compose up -d postgres redis
```

### Backend Commands
```bash
cd backend
npm install              # Install dependencies
npm run prisma:generate # Generate Prisma Client
npm run migration:run   # Run database migrations
npm run start:dev       # Start dev server
npm run prisma:studio   # Open database GUI
```

### Frontend Commands
```bash
cd frontend
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
```

### Docker Commands
```bash
docker ps                    # Check running containers
docker logs rentguard-postgres  # View PostgreSQL logs
docker-compose restart postgres # Restart PostgreSQL
docker-compose down           # Stop all services
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | Change `PORT` in `backend/.env` |
| Database connection failed | Check `docker ps` → restart postgres |
| Module not found | Delete `node_modules`, run `npm install` |
| Prisma errors | Run `npm run prisma:generate` |
| Docker not running | Start Docker Desktop |

---

## 📞 Need Help?

1. **Read:** `QUICK_START.md` for detailed steps
2. **Check:** `WHAT_TO_PROVIDE.md` for what info to share
3. **Run:** `node scripts/generate-secrets.js` for secure keys

---

## ✅ Success Indicators

You're ready when:
- ✅ Backend API responds at http://localhost:3001/api/docs
- ✅ Frontend loads at http://localhost:3000
- ✅ Can register a user via API docs
- ✅ Database tables created (check Prisma Studio)

---

**Total Setup Time: ~20 minutes** ⏱️
