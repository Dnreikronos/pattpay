# Email/Password Authentication - Setup Guide

## ✅ Implementation Complete

The email/password authentication backend has been successfully implemented with the following features:

### 🎯 Features

- **Secure Authentication**: bcrypt password hashing (10 rounds)
- **JWT Tokens**: 24-hour expiration with secure secret
- **Validation**: Zod schemas for all inputs
- **Error Handling**: Consistent error responses across all endpoints
- **CORS**: Configured for frontend communication
- **Type Safety**: Full TypeScript support with custom type definitions

### 📁 Files Created

```
backend/src/
├── config.ts                      # Environment validation with Zod
├── db.ts                          # Prisma client singleton
├── types/
│   └── index.d.ts                # TypeScript type definitions
├── controllers/
│   └── auth.controller.ts        # Authentication business logic
├── routes/
│   └── auth.routes.ts            # Route definitions
└── index.ts                      # Main server (updated)

backend/.env.example               # Environment variables template
```

## 🚀 Quick Start

### 1. Setup Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pattpay"
JWT_SECRET="your-super-secret-key-at-least-32-characters-long-change-this-in-production"
NODE_ENV="development"
PORT="3000"
FRONTEND_URL="http://localhost:3000"
```

⚠️ **Important**: The `JWT_SECRET` must be at least 32 characters long!

### 2. Start Database

```bash
npm run compose:up
```

### 3. Run Migrations

```bash
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📡 API Endpoints

### Base URL

`http://localhost:3000/api/auth`

### 1. Signup - `POST /api/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "securePassword123",
  "walletAddress": "9WzDXwBbJ1hzNXCg5kKmJEt2dSEzGbZQfH6VkYxR2qL7",
  "tokenAccountUSDT": "5FHneW5g7R9VqXYJjKmXC2BnQGQZMz6LVxpPzYWBHk3T",
  "tokenAccountUSDC": "8RtJkLvW4h9HzKxMqXYPNc8QwZGzTvFx6VyPnRBkL2K9"
}
```

**Success Response (201):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "authMethod": "EMAIL_PASSWORD",
    "walletAddress": "9WzDXwBbJ1hzNXCg5kKmJEt2dSEzGbZQfH6VkYxR2qL7",
    "tokenAccountUSDT": "5FHneW5g7R9VqXYJjKmXC2BnQGQZMz6LVxpPzYWBHk3T",
    "tokenAccountUSDC": "8RtJkLvW4h9HzKxMqXYPNc8QwZGzTvFx6VyPnRBkL2K9",
    "description": null,
    "createdAt": "2025-10-22T12:00:00.000Z",
    "updatedAt": "2025-10-22T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400` - Validation error (invalid email, weak password, etc.)
- `409` - Email or wallet address already exists
- `500` - Server error

### 2. Signin - `POST /api/auth/signin`

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "user": {
    /* same as signup */
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Invalid credentials
- `500` - Server error

### 3. Get Current User - `GET /api/auth/me`

Get authenticated user's information.

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**

```json
{
  "user": {
    /* same as signup */
  }
}
```

**Error Responses:**

- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Server error

### 4. Health Check - `GET /health`

Check if the server is running.

**Success Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

## 🧪 Testing with cURL

### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securePassword123",
    "walletAddress": "9WzDXwBbJ1hzNXCg5kKmJEt2dSEzGbZQfH6VkYxR2qL7",
    "tokenAccountUSDT": "5FHneW5g7R9VqXYJjKmXC2BnQGQZMz6LVxpPzYWBHk3T",
    "tokenAccountUSDC": "8RtJkLvW4h9HzKxMqXYPNc8QwZGzTvFx6VyPnRBkL2K9"
  }'
```

### Signin

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePassword123"
  }'
```

### Get Me (replace YOUR_TOKEN with actual token)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 Validation Rules

### Email

- Must be a valid email format (RFC 5322)

### Password

- Minimum 8 characters
- No maximum length (stored as bcrypt hash)

### Solana Addresses

- walletAddress, tokenAccountUSDT, tokenAccountUSDC
- Must match Solana address format: 32-44 base58 characters

### Name

- Required
- Maximum 255 characters

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 24-hour expiration, secure secret
3. **Generic Error Messages**: Prevents user enumeration attacks
4. **CORS Protection**: Only allows configured frontend origin
5. **Input Validation**: Strict Zod schemas on all endpoints
6. **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 🐛 Troubleshooting

### Server won't start

- Check that `.env` file exists and has all required variables
- Verify `JWT_SECRET` is at least 32 characters
- Ensure database is running: `npm run compose:up`

### Database connection errors

- Verify `DATABASE_URL` in `.env` is correct
- Check if PostgreSQL container is running: `docker ps`
- Try restarting containers: `npm run compose:down && npm run compose:up`

### JWT token errors

- Ensure token is included in `Authorization: Bearer <token>` header
- Check if token has expired (24-hour lifetime)
- Verify `JWT_SECRET` hasn't changed since token was issued

## 📝 Next Steps

This MVP implementation provides a solid foundation. Future enhancements could include:

- [ ] Password reset via email
- [ ] Email verification
- [ ] Refresh token mechanism
- [ ] Rate limiting
- [ ] Session management
- [ ] Two-factor authentication
- [ ] Integration with SIWS (Sign In With Solana)

## 🎉 Ready to Use!

Your email/password authentication system is now ready to use. All linting errors have been resolved and the code follows TypeScript best practices.
