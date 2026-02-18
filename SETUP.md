# RentGuard Setup Guide

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repo-url>
cd RentGuard

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Step 2: Configure Environment Variables

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://rentguard:changeme@localhost:5432/rentguard_db
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key-here
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=rentguard-documents
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Step 3: Start Infrastructure

```bash
# Start PostgreSQL, Redis, Kafka
docker-compose up -d postgres redis kafka zookeeper
```

### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run migration:run

# Start backend (development)
npm run start:dev
```

Backend will run on `http://localhost:3001`
API Documentation: `http://localhost:3001/api/docs`

### Step 5: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start frontend (development)
npm run dev
```

Frontend will run on `http://localhost:3000`

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
npm run test:e2e
```

### Database Management

```bash
cd backend

# Create a new migration
npm run migration:generate -- --name migration_name

# Apply migrations
npm run migration:run

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Code Quality

```bash
# Backend linting
cd backend
npm run lint
npm run format

# Frontend linting
cd frontend
npm run lint
```

## Production Build

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Docker Production

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps`
- Check DATABASE_URL in `.env`
- Verify network connectivity

### Port Conflicts
- Backend default: 3001
- Frontend default: 3000
- PostgreSQL: 5432
- Redis: 6379
- Kafka: 9092

Change ports in `docker-compose.yml` if needed.

### Prisma Issues
```bash
# Reset database (WARNING: Deletes all data)
npm run migration:reset

# Regenerate Prisma Client
npm run prisma:generate
```

## Next Steps

1. Create your first user account
2. Complete identity verification
3. List your first property (if landlord)
4. Explore the API documentation at `/api/docs`

For detailed API documentation, see `docs/API.md`
For deployment instructions, see `docs/DEPLOYMENT.md`
