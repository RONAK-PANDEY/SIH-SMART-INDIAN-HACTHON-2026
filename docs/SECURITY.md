# Security Notes

This document describes what is implemented in this prototype. It is not a compliance certification.

## Authentication

- JWT sessions use HS256 and expire after 24 hours.
- The backend provides four-role RBAC.
- `JWT_SECRET` and API keys are read from environment variables. The fallback secret in `config.py` is for development only and must be overridden before deployment.

## QR token integrity

- The server generates a SHA-256 hash for every QR token.
- The scan endpoint recomputes and compares the hash, rejecting tampered payloads and repeat scans.

## Data

- The prototype supports Supabase/Postgres configuration for health data.
- Encryption at rest and in transit must be configured by the deployment and database infrastructure; it is not supplied by this repository.

## Known gaps before a real deployment

- CORS currently allows all origins; restrict it to the actual frontend origins.
- Authentication endpoints are not rate limited.
- CI does not run dependency or security scanning.
- ABDM/HIPAA-style compliance is a design goal, not an audited property of this prototype.

Report issues through the repository issue tracker.
