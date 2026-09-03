# SecureAuth Submission Checklist

## Core Requirements

REST API backend
PostgreSQL database
Prisma ORM
Database migrations
Database seed script
User registration
Password hashing with bcrypt
User login
JWT access tokens
Short-lived access tokens
Refresh tokens
Hashed refresh tokens
Revocable refresh tokens
Refresh token rotation
Protected API endpoints
Phone-based OTP 2FA
Hashed OTP storage
5-minute OTP expiry
Single-use OTP
OTP attempt counter
OTP rate limiting
Mock SMS adapter
2FA login flow
Forgot-password flow
Cryptographically random reset tokens
Hashed reset tokens
1-hour reset token expiry
Single-use reset tokens
Refresh sessions revoked after password reset
Login rate limiting
Forgot-password rate limiting
Request validation
Prisma-based parameterized database access
Admin user listing
Docker Compose setup

## Testing

Automated tests
Registration flow
Login flow
2FA enable and verification
Refresh-token flow
Forgot-password flow
Password-reset flow
Final test run before submission

## Documentation

README finalized
Setup instructions verified
Evaluator credentials documented
API endpoints documented
Security decisions documented
SUBMISSION.md created
PROOF_OF_SUBMISSION files created
Demo video recorded
Demo video is 6 minutes or less
Video link added to SUBMISSION.md

## Final Verification

Docker Compose starts successfully
Database migrations apply successfully
Database seed works
Backend starts successfully
Frontend starts successfully
Registration works
Login works
2FA enable flow works
2FA login works
Protected endpoint works
Refresh token flow works
Forgot-password request works
Password reset works
Old password is rejected after reset
Refresh sessions are revoked after password reset
Admin dashboard works
No secrets are committed to Git
Final GitHub push completed
