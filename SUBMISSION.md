# SecureAuth Platform

## Overview

SecureAuth is a secure authentication platform built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

The project implements user registration and login, JWT-based authentication, refresh-token rotation, phone OTP-based two-factor authentication, forgot-password and password-reset flows, rate limiting, request validation, and an admin user dashboard.

## Technology Stack

Backend: Node.js, Express, TypeScript

Database: PostgreSQL

ORM: Prisma

Authentication: JWT

Password hashing: bcrypt

Testing: Jest and Supertest

Frontend: React, TypeScript, Vite

Containerization: Docker and Docker Compose

## Running the Project

Clone the repository and navigate to the project directory.

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Create the required environment configuration using the provided `.env.example` file.

Start the complete application with Docker Compose:

```bash
docker compose up --build
```

The backend runs on:

```text
http://localhost:5000
```

The frontend normally runs on:

```text
http://localhost:5173
```

If Vite selects another available port, use the port shown in the terminal.

## Database

PostgreSQL runs through Docker Compose.

Prisma migrations are included in:

```text
backend/prisma/migrations
```

The seed script creates demo user and administrator accounts.

To run the seed:

```bash
cd backend
npx prisma db seed
```

## Evaluator Credentials

Demo user:

```text
Email: demo@secureauth.com
Password: TestPassword123!
```

Administrator:

```text
Email: admin@secureauth.com
Password: AdminPassword123!
```

The OTP used during 2FA testing is printed by the mock SMS adapter in the backend/Docker logs.

## Main Authentication Flows

### Registration

Users can create an account with their email, password, and phone number.

Passwords are hashed with bcrypt before being stored in the database.

### Login

Successful authentication generates a short-lived JWT access token and a long-lived refresh token.

Access tokens expire after 15 minutes.

Refresh tokens are stored server-side as SHA-256 hashes and can be revoked.

### Two-Factor Authentication

Users can enable phone-based two-factor authentication.

The system generates a six-digit OTP and stores only its bcrypt hash.

OTP codes expire after 5 minutes, are single-use, and have an attempt limit.

For this assignment, SMS delivery is implemented using a mock SMS adapter that logs the OTP to the backend console.

### Refresh Tokens

Refresh tokens are stored server-side in hashed form.

When a refresh token is used successfully, it is revoked and replaced with a new refresh token.

### Forgot Password

Password reset tokens are generated using cryptographically secure random bytes.

Only the SHA-256 hash of the token is stored in the database.

Reset tokens expire after one hour and can only be used once.

Existing refresh sessions are revoked after a successful password reset.

## Security Controls

The project includes:

* Password hashing with bcrypt
* Short-lived JWT access tokens
* Hashed and revocable refresh tokens
* Refresh-token rotation
* Hashed OTP codes
* OTP expiration and attempt limits
* OTP rate limiting
* Cryptographically random password-reset tokens
* Password-reset token hashing
* Single-use password-reset tokens
* Login rate limiting
* Forgot-password rate limiting
* Request validation
* Prisma ORM for database access
* Protected API endpoints
* Active-user checks for protected authentication flows

### Bonus Security Features

- Refresh token rotation
- Refresh token reuse detection
- Automatic revocation of token chains after reuse attempts
- Audit logging of authentication events

## Automated Tests

The backend contains automated tests covering the main authentication flows, including registration, login, two-factor authentication, token refresh, forgot-password, and password-reset functionality.

Run the tests with:

```bash
cd backend
npm test
```

## Docker

The project includes Docker Compose configuration for running the PostgreSQL database and backend service.

The application can therefore be started without manually configuring a local PostgreSQL installation.

## Proof of Submission

The `PROOF_OF_SUBMISSION` directory contains the cryptographic proof files required by the assignment.

The proof is generated using:

* A locally generated 32-byte random challenge
* The Git commit hash obtained using `git rev-parse HEAD`
* SHA-256 of the exact concatenation of `challenge + commit_hash`
* An ECDSA key pair using the `secp256r1` / `prime256v1` curve
* A base64-encoded ECDSA signature

### Proof generation script

The proof was generated using:

```bash
./compute_proof.sh
```

The script reads `challenge.txt`, obtains the repository commit hash, computes:

```text
SHA256(challenge + commit_hash)
```

and signs the resulting digest using the locally generated ECDSA private key.

The private key is intentionally excluded from Git using `.gitignore`.

### Proof verification

The proof was independently verified using the public key with:

```bash
CHALLENGE="$(tr -d '\r\n' < challenge.txt)"
COMMIT_HASH="$(git -C .. rev-parse HEAD)"

printf '%s' "${CHALLENGE}${COMMIT_HASH}" | openssl dgst -sha256 -binary > verify_digest.bin

base64 -d proof.txt > verify_signature.der

openssl pkeyutl \
  -verify \
  -rawin \
  -pubin \
  -inkey proof_pub.pem \
  -in verify_digest.bin \
  -sigfile verify_signature.der
```

Verification result:

```text
Signature Verified Successfully
```

The proof files included in `PROOF_OF_SUBMISSION` are:

```text
challenge.txt
compute_proof.sh
proof.txt
proof_pub.pem
```

The private signing key is not included in the submission.

### Proof generation evidence

The proof was generated against the repository HEAD commit at the time of proof generation:

```text
Commit hash: f154d79ec298cb33f4008dbfdc32eede07eee72f
```

The SHA-256 digest of the concatenated challenge and commit hash was:

```text
f4c552688baf0ff0d5c74e36389e03f7f75dfc2308d9c6f3fc75c5ff33498ca6
```

To independently reproduce the digest calculation:

```bash
CHALLENGE="$(tr -d '\r\n' < challenge.txt)"
COMMIT_HASH="$(git -C .. rev-parse HEAD)"

printf '%s' "${CHALLENGE}${COMMIT_HASH}" | sha256sum
```

The resulting SHA-256 digest should match the digest recorded above.

The proof signature was successfully verified against `proof_pub.pem` using OpenSSL ECDSA verification.

## Demo Video

The final demonstration video will cover:

* Registration
* 2FA enablement
* OTP delivery through the mock SMS adapter
* Password and OTP-based login
* Protected API access
* Refresh-token flow
* Forgot-password and password-reset flow
* Automated tests
* Security implementation
* Docker setup

Video link:

To be added before final submission.

## Repository

GitHub repository:

To be added before final submission.

