# Security Policy

## Reporting a Vulnerability

The SmartCare team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the project maintainers:

- **Email**: [security@smartcare-sih.in] 
- **Subject Line**: `[SECURITY] SmartCare Vulnerability Report`

### What to Include

Please include the following information in your report:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Affected components** (backend, patient-portal, admin-portal, govt-portal, scanner)
4. **Potential impact** assessment
5. **Suggested fix** (if you have one)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment of report | **Within 48 hours** |
| Initial assessment | **Within 72 hours** |
| Status update | **Within 1 week** |
| Fix deployed | **Within 2 weeks** (critical) |

### Scope

The following are **in scope** for security reports:

- Authentication & authorization bypasses
- Patient data exposure (PHI leaks)
- QR token forgery or replay attacks
- SQL injection, XSS, CSRF vulnerabilities
- WebSocket hijacking
- API rate limit bypasses
- Privilege escalation between roles

The following are **out of scope**:

- Denial of service (DoS) attacks
- Social engineering
- Physical security
- Issues in third-party dependencies (report upstream)

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations
- Do not access or modify other users' data
- Report findings promptly
- Do not exploit vulnerabilities beyond demonstration

### Recognition

We are happy to acknowledge security researchers who report valid vulnerabilities (with your permission) in our project documentation.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| v3.0.0 (current) | ✅ Active security updates |
| v2.x.x | ⚠️ Critical fixes only |
| v1.x.x | ❌ No longer supported |
