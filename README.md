# RentGuard – Secure Digital Tenant Verification & Rental Ecosystem

> Production-ready SaaS platform for Bangladesh's rental ecosystem

## 🌍 Overview

RentGuard is a comprehensive digital rental ecosystem platform that replaces manual police tenant verification, eliminates middlemen (dalals), and introduces a transparent Tenant Credit Score system using NID + biometric verification.

## � Architecture

- **Architecture Pattern**: Clean Architecture + Domain-Driven Design (DDD)
- **Deployment Model**: Cloud-native (AWS)
- **Backend**: NestJS (TypeScript) - Microservices-ready
- **Frontend**: Next.js 14+ (TypeScript) with Tailwind CSS
- **Database**: PostgreSQL (primary), Redis (caching), S3 (storage)
- **Event System**: Kafka/RabbitMQ for event-driven architecture
- **Containerization**: Docker + Kubernetes-ready
- **CI/CD**: GitHub Actions

## � Core Modules

1. **Auth & Identity Service** - NID OCR, biometric verification, KYC
2. **Tenant Credit Score Engine** - Hybrid ML + rules-based scoring (0-1000)
3. **Property Management System** - Listings, availability, smart filtering
4. **Digital Lease Engine** - Smart contracts, e-signature, automation
5. **Dispute Resolution System** - Evidence, moderation, arbitration
6. **Fraud Detection Module** - ML-based anomaly detection
7. **Payments Integration** - bKash, Nagad, bank transfers
8. **Admin Control Center** - Risk dashboards, compliance reports

## 🔐 Security Features

- AES-256 encryption for sensitive data
- TLS 1.3 everywhere
- Role-Based Access Control (RBAC)
- JWT access + refresh token rotation
- Rate limiting & brute force protection
- Immutable audit logging
- GDPR-style consent management
- 2FA (OTP SMS/Email)
- Device binding & IP fingerprinting

## � Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### ⚡ Fast Setup (Recommended)

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
bash scripts/setup.sh
```

### 📖 Detailed Setup Guides

- **🚀 [QUICK_START.md](./QUICK_START.md)** - Complete step-by-step guide
- **✅ [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Quick reference checklist  
- **📋 [WHAT_TO_PROVIDE.md](./WHAT_TO_PROVIDE.md)** - What info to share for help

### Manual Setup

```bash
# 1. Generate secrets
node scripts/generate-secrets.js

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Update backend/.env with generated secrets

# 4. Start infrastructure
docker-compose up -d postgres redis

# 5. Setup backend
cd backend
npm install
npm run prisma:generate
npm run migration:run
npm run start:dev

# 6. Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Backend:** http://localhost:3001 | **API Docs:** http://localhost:3001/api/docs  
**Frontend:** http://localhost:3000

## 📁 Project Structure

```
RentGuard/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules (DDD structure)
│   │   ├── common/         # Shared utilities, guards, decorators
│   │   ├── config/         # Configuration modules
│   │   └── main.ts          # Application entry point
│   ├── prisma/            # Database schema & migrations
│   └── tests/             # Backend tests
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities, API clients
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
├── shared/                 # Shared TypeScript types & utilities
├── docker/                 # Docker configurations
├── k8s/                   # Kubernetes manifests
├── .github/                # CI/CD workflows
└── docs/                   # API documentation
```

## � Development Phases

- **Phase 1**: Core Auth + Verification + Property Listing
- **Phase 2**: Credit Score + Lease Engine + Dispute
- **Phase 3**: Fraud ML + Payment + Analytics
- **Phase 4**: Government integration API

## 📊 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run test:cov          # Coverage

# Frontend tests
cd frontend
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```

## � Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📚 License

Proprietary - RentGuard Platform

## 🤝 Contributing

This is a private project. Contact the development team for access.

---

**Built with security, scalability, and transparency as core principles.**
# RentGuard
