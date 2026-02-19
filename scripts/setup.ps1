# RentGuard Setup Script for Windows PowerShell
# Run: .\scripts\setup.ps1

Write-Host "🚀 RentGuard Setup Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Generate secrets
Write-Host "🔐 Generating secure secrets..." -ForegroundColor Yellow
node scripts\generate-secrets.js
Write-Host "✅ Secrets generated" -ForegroundColor Green
Write-Host ""

# Setup backend
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "⚠️  Created backend\.env - Please update with your secrets" -ForegroundColor Yellow
} else {
    Write-Host "✅ backend\.env already exists" -ForegroundColor Green
}

Write-Host "Installing backend dependencies..."
npm install

Write-Host "Generating Prisma Client..."
npm run prisma:generate

Set-Location ..
Write-Host "✅ Backend setup complete" -ForegroundColor Green
Write-Host ""

# Setup frontend
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "✅ Created frontend\.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ frontend\.env.local already exists" -ForegroundColor Green
}

Write-Host "Installing frontend dependencies..."
npm install

Set-Location ..
Write-Host "✅ Frontend setup complete" -ForegroundColor Green
Write-Host ""

# Start infrastructure
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d postgres redis

Write-Host "Waiting for services to be ready..."
Start-Sleep -Seconds 5

# Check if services are running
$postgresRunning = docker ps | Select-String "rentguard-postgres"
$redisRunning = docker ps | Select-String "rentguard-redis"

if ($postgresRunning) {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

if ($redisRunning) {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "❌ Redis failed to start" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Set-Location backend
npm run migration:run
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update backend\.env with your secrets (if not done)"
Write-Host "2. Start backend: cd backend; npm run start:dev"
Write-Host "3. Start frontend: cd frontend; npm run dev"
Write-Host ""
Write-Host "Backend API: http://localhost:3001"
Write-Host "API Docs: http://localhost:3001/api/docs"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
