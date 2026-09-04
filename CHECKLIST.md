# SecureAuth Evaluation Checklist

## Application Setup

* [ ] Repository can be cloned successfully
* [ ] Backend dependencies can be installed
* [ ] Frontend dependencies can be installed
* [ ] Environment variables are documented
* [ ] Docker Compose configuration is available
* [ ] PostgreSQL starts successfully
* [ ] Backend starts successfully
* [ ] Frontend starts successfully

## Database

* [ ] PostgreSQL is used as the primary datastore
* [ ] Prisma configuration is included
* [ ] Database migrations are included
* [ ] Seed script is included
* [ ] Seed data can be loaded successfully
* [ ] Authentication data persists in PostgreSQL

## Authentication

* [ ] User registration works
* [ ] Passwords are hashed with bcrypt
* [ ] User login works
* [ ] JWT access token is issued
* [ ] Access token is short-lived
* [ ] Refresh token flow works
* [ ] Refresh tokens are stored server-side
* [ ] Refresh tokens are stored using hashed values
* [ ] Refresh token rotation works
* [ ] Refresh token revocation works
* [ ] Refresh token reuse detection works
* [ ] Logout invalidates the refresh session

## Two-Factor Authentication

* [ ] 2FA can be enabled
* [ ] Phone OTP is generated
* [ ] OTP is delivered through the mock SMS adapter
* [ ] OTP is hashed before database storage
* [ ] OTP expires
* [ ] OTP is single-use
* [ ] OTP attempt limits are enforced
* [ ] OTP rate limiting is implemented
* [ ] 2FA login works
* [ ] TOTP flow works where applicable

## Forgot Password

* [ ] Forgot-password request works
* [ ] Cryptographically secure reset token is generated
* [ ] Reset token is hashed before storage
* [ ] Reset token expires
* [ ] Reset token is single-use
* [ ] Password reset works
* [ ] Existing refresh sessions are revoked after reset

## API Security

* [ ] Protected endpoints require authentication
* [ ] Role-based access control works
* [ ] Active-user checks are enforced
* [ ] Request validation is implemented
* [ ] Login rate limiting is implemented
* [ ] Forgot-password rate limiting is implemented
* [ ] Prisma ORM is used for database access
* [ ] Secrets are supplied through environment variables

## Developer Tools

* [ ] Developer Tools route exists
* [ ] Developer Tools can be opened from the login page
* [ ] Developer Tools can be used during demonstration
* [ ] Developer Tools functionality is documented

## Automated Tests

* [ ] Jest tests are included
* [ ] Supertest tests are included
* [ ] Registration tests pass
* [ ] Login tests pass
* [ ] 2FA tests pass
* [ ] OTP verification tests pass
* [ ] Expired OTP tests pass
* [ ] Reused OTP tests pass
* [ ] Refresh token tests pass
* [ ] Refresh token rotation tests pass
* [ ] Refresh token revocation tests pass
* [ ] Forgot-password tests pass
* [ ] Password-reset tests pass

Run:

```powershell
cd backend
npm test
```

## Proof of Submission

* [ ] `PROOF_OF_SUBMISSION/challenge.txt` exists
* [ ] `PROOF_OF_SUBMISSION/compute_proof.sh` exists
* [ ] `PROOF_OF_SUBMISSION/proof.txt` exists
* [ ] `PROOF_OF_SUBMISSION/proof_pub.pem` exists
* [ ] Challenge contains a locally generated 32-byte hexadecimal value
* [ ] ECDSA secp256r1 key pair was generated locally
* [ ] Proof uses the repository Git commit hash
* [ ] SHA-256 digest was calculated over the exact challenge plus commit hash
* [ ] Signature verifies using `proof_pub.pem`
* [ ] Private signing key is excluded from the repository
* [ ] Proof commands are documented in `SUBMISSION.md`
* [ ] `git rev-parse HEAD` output is recorded
* [ ] SHA-256 output is recorded
* [ ] Final proof verification output is recorded

## Video Demonstration

* [ ] Video is no longer than six minutes
* [ ] Registration is demonstrated
* [ ] 2FA enablement is demonstrated
* [ ] OTP delivery is demonstrated
* [ ] Login with password and 2FA OTP is demonstrated
* [ ] Access token usage is demonstrated
* [ ] Protected endpoint is demonstrated
* [ ] Refresh token flow is demonstrated
* [ ] Forgot-password request is demonstrated
* [ ] Password reset is demonstrated
* [ ] Developer Tools are demonstrated
* [ ] OTP generation and verification logic is shown
* [ ] Video link is added to `SUBMISSION.md`

## Final Git Check

Run:

```powershell
git status
```

Confirm that no unintended files or secrets are included.

Then:

```powershell
git rev-parse HEAD
```

Confirm that the final commit hash matches the hash documented for the proof.

Finally:

```powershell
git push origin main
```

Confirm that the final repository contains all required submission files.
