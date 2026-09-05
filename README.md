# SecureAuth Platform

SecureAuth is a secure authentication platform built as a full-stack application using Node.js, Express, TypeScript, PostgreSQL, Prisma, React, and JWT-based authentication.

The project demonstrates secure authentication design: password hashing, JWT access and refresh tokens with rotation and reuse detection, phone-based OTP two-factor authentication with a TOTP fallback, a forgot-password/reset flow, role-based access control, rate limiting, request validation, protected APIs, and an administrator dashboard.

For evaluator credentials, the deployed Render URL, the GitHub repository link, the developer endpoint key, the demo video link, and the exact commands/output used for the cryptographic proof, see **SUBMISSION.md** — this README covers the project itself.

## Features

- User registration
- JWT-based authentication (short-lived access tokens, long-lived refresh tokens)
- Server-side refresh-token storage, rotation, revocation, and reuse detection
- Password hashing with bcrypt
- Phone-based OTP two-factor authentication (mock SMS adapter for local testing)
- TOTP-based two-factor authentication fallback
- OTP expiration, single-use enforcement, attempt limits, and rate limiting
- Forgot-password flow with cryptographically secure, single-use, expiring reset tokens
- Automatic refresh-session revocation after a password reset
- Role-based access control (`USER` / `ADMIN`) with an admin dashboard
- Protected REST APIs with active-user validation
- Request validation using Zod
- PostgreSQL as the primary datastore, via Prisma ORM
- Developer Tools page for exercising auth flows during testing/demonstration
- Automated authentication tests (Jest + Supertest)
- Docker Compose support
- Cryptographic proof of submission

## Technology Stack

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma, bcrypt, JSON Web Tokens, Zod, Jest, Supertest

**Frontend:** React, TypeScript, Vite, React Router

**Infrastructure:** PostgreSQL, Docker, Docker Compose, Git

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

## Getting Started

The fastest way to evaluate this project is the deployed instance — the live Render URL and evaluator login credentials (both admin and demo user) are listed in **SUBMISSION.md**.

To run it locally instead:

### 1. Get the details you'll need

Open `SUBMISSION.md` and note down:
- The GitHub repository URL (to clone, if you haven't already)
- The evaluator credentials (admin + demo user)
- The `DEV_ENDPOINT_KEY` value, needed to access the Developer Tools page and retrieve mock OTPs / password-reset links
- The Render URL, if you'd rather test the deployed app instead of running locally

### 2. Prerequisites

- Node.js and npm
- PostgreSQL, or Docker
- Git

Docker is recommended, since it provides a reproducible PostgreSQL environment.

### 3. Clone and install

```bash
git clone <repository-url>
cd secure-auth-platform

cd backend
npm install

cd ../frontend
npm install
```

### 4. Configure environment variables

Create your environment files based on the provided `.env.example` files. Required backend variables:

```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
PORT
DEV_ENDPOINT_KEY
```

Use the `DEV_ENDPOINT_KEY` value from SUBMISSION.md. Never commit real secrets, private keys, or database passwords to Git.

### 5. Start PostgreSQL and run the app

With Docker (recommended):

```bash
docker compose up --build
```

Without Docker — start PostgreSQL locally, point `DATABASE_URL` at it, then:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

In a separate terminal:

```bash
cd frontend
npm run dev
```

By default the backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173` (or whichever port Vite reports, if 5173 is taken).

### 6. Log in

Use the evaluator credentials from SUBMISSION.md, or register a new account through the UI.

## Database

PostgreSQL is the primary datastore, accessed through the Prisma ORM. Migrations live under `backend/prisma/migrations`, and the seed script is `backend/prisma/seed.ts`. The schema covers user accounts, refresh-token records, OTP records, password-reset records, and general authentication state.

## Authentication Flow

### Registration & Login

`POST /api/auth/register` hashes the password with bcrypt before storing it — passwords are never stored in plaintext. `POST /api/auth/login` validates credentials and determines whether 2FA verification is required before the session is considered authenticated.

### Access & Refresh Tokens

Access tokens are short-lived JWTs required by protected endpoints (e.g. `GET /api/profile`). Refresh tokens are long-lived, stored server-side as hashed values, and support rotation, revocation, and reuse detection via `POST /api/auth/token/refresh`. `POST /api/auth/logout` invalidates the associated refresh-token session.

### Two-Factor Authentication

Phone-based OTP 2FA is enabled via `POST /api/auth/2fa/enable` and confirmed via `POST /api/auth/2fa/verify`. OTPs are six digits, hashed at rest, short-lived, single-use, attempt-limited, and rate-limited. Locally, a mock SMS adapter logs the generated OTP so the full flow can be tested without a paid SMS provider — see the Developer Tools section below.

TOTP (authenticator-app) verification is also supported as an alternative second factor, with a dedicated setup and verification flow on the frontend.

### Forgot Password

`POST /api/auth/forgot-password` generates a cryptographically random reset token and stores only its hash — the token expires, is single-use, and never contains or exposes the user's password. `POST /api/auth/reset-password` consumes the token and sets the new password; existing refresh sessions are revoked afterward as a safety measure.

### Role-Based Access Control

Two roles exist: `USER` and `ADMIN`. Protected routes check the authenticated user's role before granting access; the admin role additionally has access to the administrator dashboard.

## Developer Tools

The frontend includes a `/developer-tools` page, linked from the login screen, for inspecting and exercising authentication flows without manually constructing requests — retrieving mock OTPs and password-reset links during testing or demonstration. It's gated by the `DEV_ENDPOINT_KEY` (see SUBMISSION.md for the evaluation key) and is intended for development/demo use only, not as a production security boundary.

## Automated Tests

The backend uses Jest and Supertest, covering registration, login (with and without 2FA), OTP generation/verification (including expired and reused OTPs), refresh-token flow/rotation/revocation, and the forgot-password/reset cycle.

```bash
cd backend
npm test
```

See SUBMISSION.md for the latest recorded test run output.

## Docker

```bash
docker compose up --build   # start app + database
docker compose down         # stop services
docker compose down -v      # stop services and remove the database volume
```

Only use `-v` when intentionally resetting the local database.

## Proof of Submission

The repository includes a `PROOF_OF_SUBMISSION/` directory containing `challenge.txt`, `compute_proof.sh`, `proof.txt`, and `proof_pub.pem`, used to cryptographically bind this submission to a specific Git commit via an ECDSA (secp256r1) signature over `SHA-256(challenge + commit hash)`. The private signing key is excluded from the repository. Exact commands, commit hash, and verification output are documented in SUBMISSION.md.

## Design Considerations

The implementation prioritizes secure, understandable authentication flows while staying practical for a challenge environment. Refresh tokens are treated as revocable server-side sessions rather than relying solely on JWT expiration, and sensitive values — passwords, refresh tokens, OTPs, and reset tokens — are hashed rather than stored in plaintext. A mock SMS adapter is used for local OTP testing so the complete 2FA workflow can be verified without depending on paid third-party SMS infrastructure.
