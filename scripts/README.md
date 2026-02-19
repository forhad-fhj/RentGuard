# RentGuard Setup Scripts

## Available Scripts

### 🔐 Generate Secrets
```bash
node scripts/generate-secrets.js
```
Generates secure random secrets for JWT and encryption keys.  
**Output:** Copy the generated values to `backend/.env`

---

### 🚀 Automated Setup (Windows)
```powershell
.\scripts\setup.ps1
```
Automated setup script for Windows PowerShell.  
**Does:**
- Checks prerequisites
- Generates secrets
- Creates .env files
- Installs dependencies
- Starts Docker services
- Runs database migrations

---

### 🚀 Automated Setup (Mac/Linux)
```bash
bash scripts/setup.sh
```
Automated setup script for Unix-based systems.  
**Does:**
- Checks prerequisites
- Generates secrets
- Creates .env files
- Installs dependencies
- Starts Docker services
- Runs database migrations

---

## Manual Setup

If automated scripts don't work, follow the manual steps in `QUICK_START.md`.

---

## Troubleshooting Scripts

### Script fails with "command not found"
- Ensure Node.js is installed: `node --version`
- Ensure Docker is installed: `docker --version`
- Use full path: `node ./scripts/generate-secrets.js`

### PowerShell execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script permissions error (Linux/Mac)
```bash
chmod +x scripts/setup.sh
chmod +x scripts/generate-secrets.js
```
