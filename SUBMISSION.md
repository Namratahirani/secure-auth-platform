# SecureAuth Platform Submission

## Overview

SecureAuth is a full-stack authentication platform built with Node.js, Express, TypeScript, Prisma, PostgreSQL, React, TypeScript, and Vite.

The implementation provides:

* User registration
* JWT authentication
* Short-lived access tokens
* Refresh tokens
* Refresh-token rotation
* Refresh-token revocation
* Refresh-token reuse detection
* Password hashing with bcrypt
* Phone-based OTP 2FA
* TOTP-based 2FA support
* OTP expiration and attempt limits
* OTP rate limiting
* Forgot-password flow
* Secure password-reset tokens
* Password-reset token expiration and single-use enforcement
* Role-based access control
* Protected API endpoints
* Request validation
* Authentication rate limiting
* PostgreSQL persistence
* Prisma ORM
* Mock SMS OTP delivery
* Admin dashboard
* Developer Tools
* Automated tests
* Docker Compose support
* Cryptographic proof of submission

## Technology Stack

### Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma
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

### Infrastructure

* PostgreSQL
* Docker
* Docker Compose
* Git
* Render

## Local Setup

### 1. Install dependencies

From the repository root:

```powershell
cd backend
npm install
```

Then:

```powershell
cd ..\frontend
npm install
```

### 2. Configure environment variables

Create the required environment configuration based on the project's environment example files.

The backend requires the PostgreSQL connection string and authentication secrets.

Typical variables include:

```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
PORT
DEV_ENDPOINT_KEY
```

Secrets must not be committed to Git.

For the deployed application, environment variables are configured securely in the Render backend service.

### 3. Start PostgreSQL

Using Docker Compose:

```powershell
docker compose up --build
```

Alternatively, PostgreSQL can be installed and started locally, with `DATABASE_URL` configured accordingly.

### 4. Apply database migrations

From the backend directory:

```powershell
cd backend
npx prisma migrate deploy
```

### 5. Load seed data

```powershell
npx prisma db seed
```

### 6. Start the backend

```powershell
npm run dev
```

The backend normally runs on:

```text
http://localhost:5000
```

### 7. Start the frontend

Open another terminal:

```powershell
cd frontend
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

If Vite selects another port, use the URL displayed by Vite.

## Database

PostgreSQL is the primary datastore.

Prisma migrations are located at:

```text
backend/prisma/migrations
```

The seed script is:

```text
backend/prisma/seed.ts
```

The application persists authentication information in PostgreSQL, including user accounts, authentication state, refresh-token records, OTP records, and password-reset information.

## Evaluator Credentials

### Administrator

```text
Email: admin@secureauth.com
Password: AdminPassword123!
```

### Demo User

```text
Email: demo@secureauth.com
Password: TestPassword123!
```

These credentials are intended for evaluation and demonstration.

## Mock SMS OTP

The project uses a mock SMS adapter for local testing.

When an OTP is generated, the OTP is logged by the backend.

During the demonstration, the OTP can therefore be obtained from the backend terminal or Docker logs.

The OTP is not stored as plaintext in the database.

The OTP is hashed before persistence and is subject to expiration, single-use enforcement, attempt limits, and rate limiting.

## Authentication Endpoints

### Register

```text
POST /api/auth/register
```

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "phone": "+919876543210"
}
```

### Login

```text
POST /api/auth/login
```

The response determines whether additional 2FA verification is required.

### Enable 2FA

```text
POST /api/auth/2fa/enable
```

Requires an authenticated user.

### Verify 2FA

```text
POST /api/auth/2fa/verify
```

Used to verify the generated OTP during the 2FA flow.

### Refresh Token

```text
POST /api/auth/token/refresh
```

Used to obtain a new access token using a valid refresh token.

### Logout

```text
POST /api/auth/logout
```

Invalidates the refresh-token session.

### Forgot Password

```text
POST /api/auth/forgot-password
```

Generates a secure password-reset token.

### Reset Password

```text
POST /api/auth/reset-password
```

Consumes a valid reset token and sets a new password.

### Protected Profile

```text
GET /api/profile
```

Requires a valid access token.

## Developer Tools

The frontend includes:

```text
/developer-tools
```

The Developer Tools page is available from the login interface.

It provides a development and demonstration interface for exercising supported authentication functionality.

### Developer Endpoint Key

The Developer Tools endpoints are protected using a development authentication key.

The key is configured through the `DEV_ENDPOINT_KEY` environment variable.

For the deployed Render application, the key is configured securely in the Render backend environment variables.

For evaluation, the Developer Endpoint Key is:

```text
DEV_ENDPOINT_SECRET="859ef8c84215a75e180f2ce6b6c814ce53b2129d18fa499e538b71cf41f585a5"

```

This key is intentionally provided for evaluation of the Developer Tools functionality.

The key is not stored in the GitHub repository's source code or `.env` files.

For local development, configure the same variable in the local `.env` file:

```text
DEV_ENDPOINT_KEY=YOUR_DEV_ENDPOINT_KEY
```

The Developer Tools feature is intended for development and evaluation purposes.

## Security Implementation

The implementation includes:

* bcrypt password hashing
* Short-lived JWT access tokens
* Hashed refresh tokens
* Server-side refresh-token persistence
* Refresh-token rotation
* Refresh-token revocation
* Refresh-token reuse detection
* Hashed OTP values
* OTP expiration
* OTP single-use enforcement
* OTP attempt limits
* OTP rate limiting
* Login rate limiting
* Forgot-password rate limiting
* Cryptographically secure reset tokens
* Hashed reset tokens
* Single-use reset tokens
* Reset-token expiration
* Request validation
* Prisma ORM
* Protected routes
* Role-based access control
* Active-user checks

## Automated Tests

Tests are implemented using Jest and Supertest.

Run:

```powershell
cd backend
npm test
```

The final test run completed successfully:

```text
Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total
Snapshots:   0 total
```

The test suite covers the main authentication flows, including:

* Registration
* Login
* Login with 2FA disabled
* Login with 2FA enabled
* OTP generation
* OTP verification
* Expired OTP
* Reused OTP
* Refresh token
* Refresh token rotation
* Refresh token revocation
* Forgot password
* Password reset
* Role-based access control
* Protected routes

## Docker

Start the application and database:

```powershell
docker compose up --build
```

Stop the services:

```powershell
docker compose down
```

Reset the local Docker database:

```powershell
docker compose down -v
```

The final command removes Docker volumes and should only be used when intentionally resetting the development database.

The Docker Compose setup was successfully used to start PostgreSQL and the backend application.

## Critical Thinking Proof

The required proof files are stored under:

```text
PROOF_OF_SUBMISSION/
```

Required files:

```text
challenge.txt
compute_proof.sh
proof.txt
proof_pub.pem
```

The proof process is:

```text
challenge
+
latest Git commit hash
=
SHA-256 digest
```

The SHA-256 digest is signed using an ECDSA secp256r1 private key.

The public key is included as:

```text
PROOF_OF_SUBMISSION/proof_pub.pem
```

The private key is intentionally excluded from the repository and is listed in `.gitignore`.

The proof was regenerated after the final repository changes and independently verified successfully using the corresponding public key.

## Proof Commands

The proof was generated using:

```bash
cd PROOF_OF_SUBMISSION
./compute_proof.sh
```

The proof-generation script:

1. Reads the challenge from `challenge.txt`.
2. Obtains the current repository commit using `git rev-parse HEAD`.
3. Concatenates the challenge and commit hash without whitespace.
4. Calculates SHA-256 over the resulting message.
5. Signs the digest using the ECDSA secp256r1 private key.
6. Base64-encodes the resulting signature into `proof.txt`.

The final repository commit used for the proof is:

```text
bcc6bd1cd04406cb546f535fdcc5a7bce61fa238
```

The challenge used was:

```text
529236dc72ecbe08bd5994a34c87fdca1fe65046ad4f334ae99e726831e49a87
```

The proof signature generated from the final commit is stored in:

```text
PROOF_OF_SUBMISSION/proof.txt
```

The corresponding public key is stored in:

```text
PROOF_OF_SUBMISSION/proof_pub.pem
```

The private signing key is not included in the repository.

## Proof Verification

The proof was independently verified using the generated public key.

The verification completed successfully with:

```text
Signature Verified Successfully
```

The verification process checks that:

1. `challenge.txt` contains the generated challenge.
2. The repository commit hash is obtained using `git rev-parse HEAD`.
3. The challenge and commit hash are concatenated exactly without whitespace.
4. SHA-256 is calculated over that exact concatenation.
5. The resulting digest is verified using the ECDSA public key.
6. The signature in `proof.txt` is valid for that digest.

The final proof files tracked by Git are:

```text
PROOF_OF_SUBMISSION/challenge.txt
PROOF_OF_SUBMISSION/compute_proof.sh
PROOF_OF_SUBMISSION/proof.txt
PROOF_OF_SUBMISSION/proof_pub.pem
```

## Submission Video

The required demonstration video will be no longer than six minutes.

The video demonstrates:

1. Registration
2. Enabling 2FA
3. OTP delivery through the mock SMS adapter
4. Login using password and 2FA OTP
5. Access token usage
6. Protected endpoint access
7. Refresh token flow
8. Forgot-password request
9. Password reset
10. Developer Tools
11. OTP generation and verification logic
12. Relevant authentication implementation
13. Automated tests

Video link:

```text
https://drive.google.com/drive/folders/1_cL21Wy0JAQco5dDF0JRJ1bOKTsv2wbe?usp=sharing
```

## Repository

GitHub repository:

```text
https://github.com/Namratahirani/secure-auth-platform
```

## Deployed Application

Render deployment:

```text
https://secure-auth-platform.onrender.com
```

The deployed backend uses environment variables configured through Render rather than committing secrets to the repository.

## Final Submission Verification

Before submitting, verify:

```powershell
git status
git rev-parse HEAD
git log --oneline -3
git ls-files PROOF_OF_SUBMISSION
```

The expected working-tree state is:

```text
nothing to commit, working tree clean
```

The final commit used for the cryptographic proof is:

```text
bcc6bd1cd04406cb546f535fdcc5a7bce61fa238
```

The repository contains the required proof files:

```text
PROOF_OF_SUBMISSION/challenge.txt
PROOF_OF_SUBMISSION/compute_proof.sh
PROOF_OF_SUBMISSION/proof.txt
PROOF_OF_SUBMISSION/proof_pub.pem
```

The final repository also contains:

```text
README.md
SUBMISSION.md
CHECKLIST.md
docker-compose.yml
PROOF_OF_SUBMISSION/challenge.txt
PROOF_OF_SUBMISSION/compute_proof.sh
PROOF_OF_SUBMISSION/proof.txt
PROOF_OF_SUBMISSION/proof_pub.pem
```

Before final submission, ensure that the following placeholders have been replaced:

```text
PASTE_DEV_ENDPOINT_KEY_HERE
PASTE_VIDEO_LINK_HERE
PASTE_GITHUB_REPOSITORY_URL_HERE
PASTE_RENDER_URL_HERE
```

After completing these updates, commit the documentation changes and regenerate the cryptographic proof if the documentation commit becomes the final submission commit.
