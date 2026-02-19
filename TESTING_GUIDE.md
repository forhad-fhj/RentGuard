# 🧪 RentGuard API Testing Guide

## Quick Start Testing

### 1. Access API Documentation

Open in browser:
```
http://localhost:3001/api/docs
```

### 2. Test User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "tenant@example.com",
  "phone": "+8801712345678",
  "password": "SecurePass123!",
  "role": "TENANT"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "tenant@example.com",
      "phone": "+8801712345678",
      "role": "TENANT"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### 3. Test Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "tenant@example.com",
  "password": "SecurePass123!"
}
```

**Save the `accessToken`** - you'll need it for authenticated requests!

### 4. Authorize in Swagger

1. Click the **"Authorize"** button (🔒) at the top
2. In the "Value" field, paste: `Bearer <your-access-token>`
3. Click "Authorize"
4. Now all authenticated endpoints will work!

### 5. Test Authenticated Endpoints

**Get Your Credit Score:**
- `GET /api/v1/credit-score/me`
- Should return your credit score (default: 500)

**Get Verification Status:**
- `GET /api/v1/identity/status`
- Should return verification status

**List Properties:**
- `GET /api/v1/properties`
- Returns all available properties

---

## 🧑‍💼 Test as Landlord

### 1. Register as Landlord

```json
{
  "email": "landlord@example.com",
  "phone": "+8801712345679",
  "password": "SecurePass123!",
  "role": "LANDLORD"
}
```

### 2. Create Property

**Endpoint:** `POST /api/v1/properties`

**Request Body:**
```json
{
  "title": "Modern Apartment in Dhanmondi",
  "description": "Beautiful 2BR apartment with modern amenities",
  "propertyType": "APARTMENT",
  "address": "House 15, Road 27, Dhanmondi",
  "city": "Dhaka",
  "district": "Dhaka",
  "bedrooms": 2,
  "bathrooms": 1,
  "rentAmount": 25000,
  "depositAmount": 50000,
  "availableFrom": "2024-03-01T00:00:00Z"
}
```

---

## 🔍 Testing Checklist

### Authentication
- [ ] Register tenant user
- [ ] Register landlord user
- [ ] Login with credentials
- [ ] Refresh token works
- [ ] Invalid credentials rejected

### Identity Verification
- [ ] Submit verification documents
- [ ] Check verification status
- [ ] View pending verifications (Admin)

### Properties
- [ ] List all properties
- [ ] Create property (Landlord)
- [ ] Get property details
- [ ] Apply for property (Tenant)

### Credit Score
- [ ] Get own credit score
- [ ] View credit score history
- [ ] Landlord can view tenant score

### Leases
- [ ] Create lease
- [ ] Sign lease (both parties)
- [ ] View lease details
- [ ] Track lease events

### Payments
- [ ] Create payment
- [ ] Process payment
- [ ] View payment history

---

## 🛠️ Using Postman/Insomnia

**Base URL:** `http://localhost:3001/api/v1`

**Headers for authenticated requests:**
```
Authorization: Bearer <your-access-token>
Content-Type: application/json
```

---

## 🐛 Troubleshooting

**401 Unauthorized:**
- Token expired or invalid
- Get new token via login
- Make sure "Bearer " prefix is included

**403 Forbidden:**
- Insufficient permissions
- Check user role matches endpoint requirements

**404 Not Found:**
- Check endpoint URL
- Verify resource exists

**500 Internal Server Error:**
- Check backend logs
- Verify database connection
- Check required fields in request

---

## 📊 Database Inspection

**View all users:**
```bash
docker exec rentguard-postgres psql -U rentguard -d rentguard_db -c "SELECT id, email, role FROM users;"
```

**View properties:**
```bash
docker exec rentguard-postgres psql -U rentguard -d rentguard_db -c "SELECT id, title, city, \"rentAmount\" FROM properties;"
```

**Open Prisma Studio (GUI):**
```bash
cd backend
npm run prisma:studio
```
Opens at `http://localhost:5555`

---

**Happy Testing!** 🎉
