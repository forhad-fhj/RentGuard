# RentGuard API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+8801712345678",
  "password": "SecurePassword123!",
  "role": "TENANT" // Optional: TENANT, LANDLORD
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Identity Verification

#### Submit Verification
```http
POST /identity/verify
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "nidNumber": "1234567890123",
  "nidFrontImage": "<base64 or file>",
  "nidBackImage": "<base64 or file>",
  "selfieImage": "<base64 or file>"
}
```

#### Get Verification Status
```http
GET /identity/status
Authorization: Bearer <token>
```

### Credit Score

#### Get My Credit Score
```http
GET /credit-score/me
Authorization: Bearer <token>
```

#### Get Tenant Credit Score (Landlord/Admin)
```http
GET /credit-score/tenant/:tenantId
Authorization: Bearer <token>
```

### Properties

#### List Properties
```http
GET /properties?city=Dhaka&minRent=10000&maxRent=50000
```

#### Get Property
```http
GET /properties/:id
```

#### Create Property (Landlord)
```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Modern Apartment in Dhanmondi",
  "description": "...",
  "propertyType": "APARTMENT",
  "address": "...",
  "city": "Dhaka",
  "district": "Dhaka",
  "bedrooms": 2,
  "bathrooms": 1,
  "rentAmount": 25000,
  "depositAmount": 50000,
  "availableFrom": "2024-01-01"
}
```

#### Apply for Property
```http
POST /properties/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I'm interested in this property"
}
```

### Leases

#### Create Lease
```http
POST /leases
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "...",
  "tenantId": "...",
  "landlordId": "...",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "monthlyRent": 25000,
  "depositAmount": 50000
}
```

#### Sign Lease
```http
POST /leases/:id/sign
Authorization: Bearer <token>
Content-Type: application/json

{
  "signature": "<signature_data>"
}
```

### Payments

#### Create Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaseId": "...",
  "paymentMethod": "BKASH"
}
```

#### Process Payment
```http
POST /payments/:id/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "TRX123456789"
}
```

### Disputes

#### Create Dispute
```http
POST /disputes
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaseId": "...",
  "tenantId": "...",
  "landlordId": "...",
  "type": "PAYMENT",
  "title": "Payment Dispute",
  "description": "..."
}
```

### Admin

#### Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
