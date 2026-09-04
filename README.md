# SecureAuth Platform

SecureAuth is a secure authentication platform built as a full-stack application using Node.js, Express, TypeScript, PostgreSQL, Prisma, React, and JWT-based authentication.

The project demonstrates secure authentication design with password hashing, JWT access and refresh tokens, phone-based OTP two-factor authentication, TOTP support, forgot-password and password-reset flows, role-based access control, rate limiting, request validation, protected APIs, and an administrator dashboard.

## Features

* User registration
* JWT-based authentication
* Short-lived access tokens
* Long-lived refresh tokens
* Server-side refresh token storage
* Refresh token rotation
* Refresh token reuse detection
* Refresh token revocation
* Password hashing using bcrypt
* Phone-based OTP two-factor authentication
* OTP expiration and single-use enforcement
* OTP attempt limits
* OTP rate limiting
* TOTP-based two-factor authentication fallback
* Forgot-password flow
* Cryptographically secure password-reset tokens
* Single-use password-reset tokens
* Password-reset token expiration
* Automatic refresh-session revocation after password reset
* Protected REST APIs
* Role-based access control
* Active-user validation
* Login rate limiting
* Forgot-password rate limiting
* Request validation using Zod
* PostgreSQL as the primary datastore
* Prisma ORM
* Mock SMS adapter for local OTP testing
* Admin dashboard
* Developer Tools page for authentication and API testing
* Automated authentication tests
* Docker Compose support
* Cryptographic proof of submission

## Technology Stack

### Backend

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma ORM
* bcrypt
* JSON Web Tokens
* Zod
* Jest
* Supertest

### Frontend

* React
* TypeScript
* Vite
* React Router

### Authentication

* JWT access tokens
* JWT refresh tokens
* bcrypt password hashing
* SMS OTP authentication
* TOTP authentication
* Cryptographically secure password-reset tokens

### Infrastructure

* PostgreSQL
* Docker
* Docker Compose
* Git

## Project Structure

```text
secure-auth-platform/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── PROOF_OF_SUBMISSION/
│
├── README.md
├── SUBMISSION.md
├── CHECKLIST.md
└── docker-compose.yml
```

The exact directory contents may vary depending on the implementation, but the backend and frontend are separated into independent applications.

## Local Setup

### Prerequisites

Install the following:

* Node.js
* npm
* PostgreSQL, or Docker
* Git

Docker is recommended because it provides a reproducible PostgreSQL environment.

### Clone the repository

```bash
git clone <repository-url>
cd secure-auth-platform
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Environment Variables

Create the required environment files using the provided environment example files where available.

Secrets and database credentials must be supplied through environment variables.

Typical backend configuration includes:

```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
PORT
```

Do not commit production secrets, private keys, database passwords, or other sensitive credentials to Git.

## Running with Docker

From the repository root:

```bash
docker compose up --build
```

The Docker configuration provides the PostgreSQL database and application services required for local development.

## Running Without Docker

Start PostgreSQL locally and configure the backend `DATABASE_URL`.

Then run:

```bash
cd backend
npm install
```

Apply Prisma migrations:

```bash
npx prisma migrate deploy
```

Run seed data:

```bash
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The backend normally runs on:

```text
http://localhost:5000
```

The frontend normally runs on:

```text
http://localhost:5173
```

If Vite selects another available port, use the URL displayed in the terminal.

## Database

PostgreSQL is the primary datastore.

Prisma is used as the ORM and database access layer.

Database migrations are stored under:

```text
backend/prisma/migrations
```

The seed script is:

```text
backend/prisma/seed.ts
```

Run migrations with:

```bash
cd backend
npx prisma migrate deploy
```

Run the seed with:

```bash
npx prisma db seed
```

The database contains authentication-related records including users, refresh tokens, OTP information, password-reset information, and authentication state.

## Authentication Flow

### Registration

Endpoint:

```text
POST /api/auth/register
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "phone": "+919876543210"
}
```

Passwords are never stored in plaintext. Passwords are hashed with bcrypt before being stored in PostgreSQL.

### Login

Endpoint:

```text
POST /api/auth/login
```

The login process validates the user's credentials and determines whether additional two-factor verification is required.

When 2FA is disabled, successful authentication provides the authenticated session.

When 2FA is enabled, the login flow requires OTP or TOTP verification before completing authentication.

### Access Tokens

Access tokens are JWTs and are intentionally short-lived.

The protected API requires a valid access token.

Example protected endpoint:

```text
GET /api/profile
```

### Refresh Tokens

Refresh tokens provide a way to obtain a new access token without requiring the user to log in again.

Refresh tokens are stored server-side using hashed values.

Refresh tokens can be revoked.

The implementation also supports refresh-token rotation and reuse detection.

Endpoint:

```text
POST /api/auth/token/refresh
```

### Logout

Endpoint:

```text
POST /api/auth/logout
```

Logout invalidates the associated refresh-token session.

## Two-Factor Authentication

The application supports phone-based OTP two-factor authentication.

### Enable 2FA

Endpoint:

```text
POST /api/auth/2fa/enable
```

This endpoint requires authentication.

The application generates a short-lived OTP for the 2FA setup process.

### Verify 2FA

Endpoint:

```text
POST /api/auth/2fa/verify
```

The OTP is verified before 2FA is enabled or the login process is completed.

OTP security controls include:

* Six-digit OTP generation
* Short expiration period
* Single-use enforcement
* Attempt limits
* OTP hashing
* Rate limiting

For local development, the project uses a mock SMS adapter. The generated OTP is logged by the backend so the complete flow can be tested without requiring a paid SMS provider.

## TOTP Support

The application also supports TOTP-based two-factor authentication.

TOTP can be used as an alternative authentication mechanism to the phone OTP flow.

The frontend includes a dedicated TOTP verification flow.

TOTP setup and verification information is handled by the backend authentication implementation.

## Forgot Password

Endpoint:

```text
POST /api/auth/forgot-password
```

The forgot-password flow does not expose or store a user's plaintext password.

A cryptographically secure random reset token is generated.

Only a hash of the reset token is stored server-side.

Reset tokens:

* Are cryptographically random
* Expire after a limited period
* Are single-use
* Cannot be reused after successful consumption
* Do not contain the user's password

Password reset endpoint:

```text
POST /api/auth/reset-password
```

Example request:

```json
{
  "token": "reset-token",
  "newPassword": "NewStrongPassword123!"
}
```

Existing refresh sessions are revoked after a successful password reset.

## Role-Based Access Control

The application supports role-based authorization.

The primary roles are:

```text
USER
ADMIN
```

Protected routes verify the authenticated user's role before granting access.

The administrator has access to the administrator dashboard.

## Developer Tools

The frontend includes a dedicated Developer Tools page:

```text
/developer-tools
```

The Developer Tools page provides a convenient interface for testing authentication-related functionality during development and demonstration.

It can be used to inspect and exercise supported authentication flows without manually constructing every request from the browser.

The route is currently available through the frontend login interface and is also registered in the React Router configuration.

Developer Tools are intended for development and demonstration purposes and should not be treated as a production administrative security boundary.

## Security Controls

The implementation includes the following security controls:

* bcrypt password hashing
* Short-lived JWT access tokens
* Server-side refresh-token storage
* Hashed refresh tokens
* Refresh-token rotation
* Refresh-token revocation
* Refresh-token reuse detection
* OTP hashing
* OTP expiration
* OTP single-use enforcement
* OTP attempt limits
* OTP rate limiting
* Login rate limiting
* Forgot-password rate limiting
* Cryptographically random password-reset tokens
* Password-reset token hashing
* Password-reset token expiration
* Password-reset token single-use enforcement
* Refresh-session revocation after password reset
* Request validation
* Prisma ORM and parameterized database operations
* Protected API routes
* Role-based authorization
* Active-user checks
* Environment-based configuration for secrets

## Automated Tests

The backend uses Jest and Supertest for automated testing.

The test suite covers the main authentication functionality, including:

* User registration
* Successful login
* Login without 2FA
* Login with 2FA
* OTP generation
* OTP verification
* Expired OTP handling
* Reused OTP handling
* Refresh token flow
* Refresh token rotation
* Refresh token revocation
* Forgot-password request
* Password-reset flow

Run the tests:

```bash
cd backend
npm test
```

## API Endpoints

The primary authentication endpoints include:

| Method | Endpoint                    | Purpose                       |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/api/auth/register`        | Register a user               |
| POST   | `/api/auth/login`           | Authenticate a user           |
| POST   | `/api/auth/2fa/enable`      | Start 2FA setup               |
| POST   | `/api/auth/2fa/verify`      | Verify 2FA OTP                |
| POST   | `/api/auth/token/refresh`   | Refresh access token          |
| POST   | `/api/auth/logout`          | Revoke authentication session |
| POST   | `/api/auth/forgot-password` | Request password reset        |
| POST   | `/api/auth/reset-password`  | Reset password                |
| GET    | `/api/profile`              | Protected profile endpoint    |

Additional endpoints may exist for TOTP, administrative functionality, and supporting authentication operations.

## Docker

The repository includes Docker Compose configuration.

Start the application using:

```bash
docker compose up --build
```

Stop the services using:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

Use the volume removal command only when intentionally resetting the local database.

## Demo Credentials

The repository submission includes evaluator credentials in `SUBMISSION.md`.

Credentials should only be used for the evaluation environment and should not be reused for production systems.

## Proof of Submission

The repository contains a `PROOF_OF_SUBMISSION` directory required by the challenge.

The directory contains:

```text
PROOF_OF_SUBMISSION/
├── challenge.txt
├── compute_proof.sh
├── proof.txt
└── proof_pub.pem
```

The proof process uses:

1. A locally generated 32-byte random hexadecimal challenge.
2. The repository's current Git commit hash.
3. SHA-256 of the exact concatenation of the challenge and commit hash.
4. An ECDSA key using the secp256r1 curve.
5. A signature stored in `proof.txt`.
6. The corresponding public key stored in `proof_pub.pem`.

The private signing key is intentionally excluded from the repository.

The exact proof-generation commands and recorded outputs are documented in `SUBMISSION.md`.

## Design Considerations

The implementation prioritizes secure and understandable authentication flows while keeping the system practical for a challenge environment.

The project uses PostgreSQL as the persistent datastore and Prisma as the database abstraction layer.

Refresh tokens are treated as revocable server-side sessions rather than relying only on JWT expiration.

Sensitive authentication values such as passwords, refresh tokens, OTPs, and password-reset tokens are not stored in plaintext where hashing is appropriate.

A mock SMS adapter is used for local OTP demonstration so that the complete 2FA workflow can be tested without depending on paid third-party SMS infrastructure.

## Demo Video

The final submission video demonstrates:

* User registration
* 2FA enablement
* OTP delivery through the mock SMS adapter
* Login with password and 2FA
* TOTP authentication where applicable
* Access token usage
* Protected endpoint access
* Refresh token flow
* Forgot-password request
* Password reset
* Developer Tools
* Automated tests
* Relevant authentication implementation
* PostgreSQL database usage

The final video link will be added before submission.

## Repository

GitHub repository:

To be added before final submission.
