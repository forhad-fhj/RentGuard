# 🚀 How to Start Both Frontend and Backend

## The Error You're Seeing

`ERR_CONNECTION_REFUSED` means the **frontend** is trying to connect to the **backend API**, but the backend isn't running.

## Solution: Start Both Services

You need **TWO terminals** running simultaneously:

### Terminal 1: Backend (Required for API)
```bash
cd backend
npm run start:dev
```

**Wait until you see:**
```
🚀 RentGuard API is running on: http://localhost:3001
📚 API Documentation: http://localhost:3001/api/docs
```

### Terminal 2: Frontend (Already Running)
```bash
cd frontend
npm run dev
```

**You should see:**
```
- Local:        http://localhost:3000
```

---

## ✅ Both Services Running?

- ✅ **Backend:** http://localhost:3001 (API + API Docs)
- ✅ **Frontend:** http://localhost:3000 (Website)

---

## 🔍 Quick Check

**Test if backend is running:**
Open in browser: http://localhost:3001/api/docs

- ✅ **If it loads:** Backend is running
- ❌ **If "can't be reached":** Backend is NOT running - start it!

---

## 📝 What Each Service Does

**Backend (Port 3001):**
- Handles all API requests
- Database operations
- Authentication
- Business logic
- Serves API documentation

**Frontend (Port 3000):**
- Displays the website
- Makes API calls to backend
- User interface
- Cannot work without backend!

---

## ⚠️ Common Mistakes

1. **Only frontend running:** You'll see `ERR_CONNECTION_REFUSED`
2. **Only backend running:** Website won't load
3. **Wrong ports:** Check `.env` files match

---

## 🎯 Quick Start Commands

**Windows PowerShell (2 terminals):**

**Terminal 1:**
```powershell
cd C:\Users\forha\OneDrive\Desktop\RentGuard\backend
npm run start:dev
```

**Terminal 2:**
```powershell
cd C:\Users\forha\OneDrive\Desktop\RentGuard\frontend
npm run dev
```

---

**Once both are running, refresh your browser and try again!** 🎉
