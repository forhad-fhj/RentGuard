# 📋 What to Provide Me - Setup Checklist

When you need help or want me to configure something, provide the following:

## 🔧 Current Setup Status

**Tell me:**
- [ ] Which step are you on? (1-5 from QUICK_START.md)
- [ ] What error are you seeing? (copy full error message)
- [ ] What have you completed so far?

---

## 📝 Environment Information

**Run these commands and share the output:**

```bash
# Node.js version
node --version

# Docker version  
docker --version

# npm version
npm --version

# Operating System
# Windows / Mac / Linux (and version)
```

---

## 🐳 Docker Services Status

**Run and share:**
```bash
docker ps
```

**Should show:**
- rentguard-postgres
- rentguard-redis

---

## 🔐 Configuration Status

**Tell me what you've configured:**

### ✅ Required (Must Have)
- [ ] `JWT_SECRET` - Have you generated/updated this?
- [ ] `JWT_REFRESH_SECRET` - Have you generated/updated this?
- [ ] `ENCRYPTION_KEY` - Have you generated/updated this?
- [ ] Database connection working?

### ⚠️ Optional (Nice to Have)
- [ ] AWS S3 credentials?
- [ ] Email SMTP settings?
- [ ] Payment gateway credentials?

---

## 🐛 Error Information

**If you're getting errors, provide:**

1. **Full error message** (copy entire stack trace)
2. **What command you ran** (exact command)
3. **Which file/directory** you were in
4. **Logs** (if available):
   ```bash
   # Backend logs
   cd backend
   npm run start:dev
   # Copy the error output
   
   # Docker logs
   docker logs rentguard-postgres
   docker logs rentguard-redis
   ```

---

## 📁 File Status

**Check and tell me:**

- [ ] Does `backend/.env` exist?
- [ ] Does `frontend/.env.local` exist?
- [ ] Have you run `npm install` in both backend and frontend?
- [ ] Have you run `npm run prisma:generate`?
- [ ] Have you run `npm run migration:run`?

---

## 🎯 What You Want to Do

**Tell me:**
- What feature are you trying to set up?
- What's your goal? (just testing, production deployment, etc.)
- Any specific requirements?

---

## 💡 Quick Help Template

Copy and fill this out:

```
**Step I'm on:** [Step X from QUICK_START.md]

**Error (if any):**
[Paste full error message here]

**Environment:**
- Node.js: [version]
- Docker: [version]
- OS: [Windows/Mac/Linux]

**Docker Status:**
[Output of `docker ps`]

**Configuration:**
- JWT_SECRET: [configured/not configured]
- Database: [working/not working]

**What I want to do:**
[Describe your goal]
```

---

## 🚀 Common Scenarios

### Scenario 1: "I want to get it running locally"
**Provide:**
- Node.js version
- Docker status
- Any errors from setup steps

### Scenario 2: "I want to configure AWS S3"
**Provide:**
- AWS Access Key ID
- AWS Secret Access Key
- AWS Region
- S3 Bucket name

### Scenario 3: "I want to set up email notifications"
**Provide:**
- SMTP host (e.g., smtp.gmail.com)
- SMTP port (e.g., 587)
- Email address
- Email password/app password

### Scenario 4: "I want to deploy to production"
**Provide:**
- Hosting platform (AWS, Azure, DigitalOcean, etc.)
- Domain name
- SSL certificate info
- Production database URL
- Production Redis URL

### Scenario 5: "I'm getting database errors"
**Provide:**
- Full error message
- `docker logs rentguard-postgres` output
- Your `DATABASE_URL` from `.env` (mask password)
- Whether PostgreSQL container is running

---

## 🔒 Security Note

**NEVER share:**
- Actual passwords
- Real API keys
- Production credentials

**DO share:**
- Error messages
- Configuration structure (with masked values)
- Environment info
- Logs (without sensitive data)

---

## 📞 Quick Commands to Run

**Before asking for help, run these:**

```bash
# 1. Check prerequisites
node --version
docker --version

# 2. Check Docker services
docker ps

# 3. Check backend setup
cd backend
npm list --depth=0
npm run prisma:generate

# 4. Check frontend setup  
cd frontend
npm list --depth=0

# 5. Check database connection
cd backend
npm run prisma:studio
# Should open Prisma Studio if DB is connected
```

---

**Once you provide this info, I can help you quickly!** 🚀
