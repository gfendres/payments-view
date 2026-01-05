# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Gnosis Card Portfolio Dashboard seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do NOT

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed
- Exploit the vulnerability beyond what is necessary to demonstrate it

### Please DO

**Report security vulnerabilities via GitHub Security Advisories:**

1. Go to the [Security tab](https://github.com/gfendres/payments-view/security) of this repository
2. Click "Report a vulnerability"
3. Fill out the form with details about the vulnerability

### What to Include in Your Report

- Type of vulnerability (e.g., XSS, CSRF, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability and how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 4 days.
- **Updates**: We will send you regular updates about our progress
- **Timeline**: We aim to patch critical vulnerabilities within 7 days and other vulnerabilities within 30 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices for Users

### Environment Variables

- **Never commit** `.env`, `.env.local`, or any file containing secrets to version control
- Use `.env.example` as a template and create your own `.env.local`
- Rotate API keys and secrets regularly
- Use different credentials for development, staging, and production

### WalletConnect Security

- Only connect wallets you trust
- Review transaction details carefully before signing
- Use hardware wallets for high-value accounts
- Never share your private keys or seed phrases

### API Keys

- Keep your WalletConnect Project ID secure (though it's public-facing)
- If you suspect your API keys are compromised, rotate them immediately
- Use environment-specific API keys (dev vs. production)

### Browser Security

- Keep your browser and extensions up to date
- Use HTTPS only (enforced by default)
- Clear browser cache/storage when using public computers
- Be cautious of browser extensions that can access your data

## Known Security Considerations

### Client-Side Authentication

This application uses Sign-In with Ethereum (SIWE) for authentication. The authentication flow:

1. User connects wallet (client-side)
2. User signs a message with their wallet (client-side)
3. Signature is verified against Gnosis Pay API (server-side via tRPC)
4. JWT token is stored in browser (httpOnly cookies recommended for production)

**Important**: JWT tokens are currently stored in localStorage. For production deployments, consider:

- Using httpOnly cookies instead
- Implementing token refresh mechanisms
- Adding CSRF protection
- Implementing rate limiting

### Third-Party APIs

This application integrates with:

- **Gnosis Pay API**: For transaction and rewards data
- **CoinGecko API**: For token pricing (public API, no authentication)
- **WalletConnect**: For wallet connections

We do not control these third-party services. Always verify:

- API responses before processing
- Transaction details before signing
- Smart contract addresses before interacting

### Data Storage

- Transaction data is fetched from Gnosis Pay API (not stored server-side)
- User preferences may be stored in browser localStorage
- No sensitive data is stored on our servers
- All data transmission uses HTTPS

## Security Features

### Implemented

- ✅ HTTPS enforced in production
- ✅ Input validation with Zod schemas
- ✅ SIWE (Sign-In with Ethereum) authentication
- ✅ Sensitive data redaction in logs
- ✅ Content Security Policy headers
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ TypeScript for type safety

### Planned

- 🔄 httpOnly cookies for JWT storage
- 🔄 CSRF token protection
- 🔄 Security headers (HSTS, X-Frame-Options, etc.)
- 🔄 Automated dependency vulnerability scanning

## Dependency Security

We use automated tools to monitor dependencies:

- **Dependabot**: Automated dependency updates (enabled)
- **npm audit**: Run `bun audit` to check for known vulnerabilities
- **Regular updates**: We aim to update dependencies monthly

### Checking for Vulnerabilities

```bash
# Check for known vulnerabilities
bun audit

# Update dependencies
bun update

# Check for outdated packages
bun outdated
```

## Secure Development Practices

### Code Review

- All changes require code review before merging
- Security-sensitive changes require additional review
- Automated tests must pass before merging

### Testing

- Unit tests for business logic
- Integration tests for API endpoints
- Security-focused test cases for authentication flows

### Logging

- Sensitive data is automatically redacted from logs
- Logs include correlation IDs for tracing
- Production logs are monitored for suspicious activity

## Compliance

This application:

- Does not store user financial data server-side
- Fetches data on-demand from Gnosis Pay API
- Uses wallet-based authentication (no passwords)
- Complies with GDPR (no personal data collection)

## Contact

For security concerns, contact:

- **GitHub Security Advisories**: [Report a vulnerability](https://github.com/gfendres/payments-view/security)

## Acknowledgments

We would like to thank the following security researchers for responsibly disclosing vulnerabilities:

*(This section will be updated as vulnerabilities are reported and fixed)*

---

**Last Updated**: January 2026
