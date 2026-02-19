# API Documentation Link

## Why does "API Docs" show "This site can't be reached"?

The API documentation is served by the **backend** server, not the frontend. If the backend is not running, the link will fail.

## Fix

1. Open a **new terminal** (keep the frontend running in the other one).
2. Start the backend:
   ```bash
   cd backend
   npm run start:dev
   ```
3. Wait until you see: `RentGuard API is running on: http://localhost:3001`
4. Then open: **http://localhost:3001/api/docs**

You need **both** running:
- **Frontend:** http://localhost:3000 (Next.js)
- **Backend:** http://localhost:3001 (NestJS) — serves the API and API docs
