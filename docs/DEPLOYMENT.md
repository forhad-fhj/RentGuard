# RentGuard Deployment Guide

## Prerequisites

- Docker & Docker Compose
- AWS Account (for S3)
- PostgreSQL 15+
- Redis 7+
- Node.js 20+ (for local development)

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repo-url>
cd RentGuard
```

### 2. Environment Configuration

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Start Services

```bash
# Start all services (PostgreSQL, Redis, Kafka)
docker-compose up -d

# Install backend dependencies
cd backend
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run migration:run

# Start backend dev server
npm run start:dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

## Production Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

```bash
# Apply configurations
kubectl apply -f k8s/
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/rentguard_db
REDIS_URL=redis://host:6379
JWT_SECRET=<strong-secret-key>
AWS_S3_BUCKET=rentguard-documents
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.rentguard.bd/api/v1
```

## Database Migrations

```bash
cd backend
npm run migration:run
```

## Monitoring

- Prometheus metrics: `http://localhost:9090`
- Grafana dashboards: `http://localhost:3001`
- Application logs: Check Docker logs or Sentry

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable TLS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts

## Scaling

### Horizontal Scaling

- Backend: Deploy multiple instances behind load balancer
- Frontend: Use CDN for static assets
- Database: Use read replicas for read-heavy operations
- Redis: Use Redis Cluster for high availability

### Vertical Scaling

- Increase container resources in docker-compose.yml
- Adjust Kubernetes resource limits

## Backup & Recovery

### Database Backup
```bash
pg_dump -U rentguard rentguard_db > backup.sql
```

### Restore
```bash
psql -U rentguard rentguard_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Redis connection failed**
   - Check REDIS_URL in .env
   - Verify Redis is running

3. **S3 upload failed**
   - Verify AWS credentials
   - Check S3 bucket permissions

4. **JWT token invalid**
   - Verify JWT_SECRET matches
   - Check token expiration
