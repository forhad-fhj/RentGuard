#!/bin/bash

# RentGuard Setup Script
# Run: bash scripts/setup.sh

set -e

echo "🚀 RentGuard Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Generate secrets
echo "🔐 Generating secure secrets..."
node scripts/generate-secrets.js > .secrets.tmp
echo -e "${GREEN}✅ Secrets generated${NC}"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created backend/.env - Please update with your secrets${NC}"
    echo "   Run: node ../scripts/generate-secrets.js"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma Client..."
npm run prisma:generate

cd ..
echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.local already exists${NC}"
fi

echo "Installing frontend dependencies..."
npm install

cd ..
echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Start infrastructure
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

echo "Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker ps | grep -q rentguard-postgres; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

if docker ps | grep -q rentguard-redis; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    exit 1
fi

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
cd backend
npm run migration:run
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your secrets (if not done)"
echo "2. Start backend: cd backend && npm run start:dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend API: http://localhost:3001"
echo "API Docs: http://localhost:3001/api/docs"
echo "Frontend: http://localhost:3000"
echo ""
