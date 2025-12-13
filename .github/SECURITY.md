# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@neskeep.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Security Update Process

1. We will confirm the vulnerability and determine its impact
2. We will create a security advisory on GitHub
3. We will prepare a fix and release a new version
4. We will publicly disclose the vulnerability after the fix is released

## Security Best Practices

When using Nuxt CMS, we recommend:

1. **Never commit sensitive data** - Use environment variables for secrets
2. **Keep dependencies updated** - Regularly run `npm update`
3. **Use strong passwords** - Change default admin credentials immediately
4. **Enable HTTPS** - Always use HTTPS in production
5. **Implement rate limiting** - The module includes basic rate limiting, but consider additional protection
6. **Regular backups** - Back up your database regularly
7. **Review user permissions** - Use the RBAC system to limit user access appropriately

## Known Security Considerations

- JWT secrets should be at least 32 characters long
- Default admin credentials must be changed before production deployment
- File uploads are restricted by type and size, but consider additional validation at the application level

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged in our security advisories (unless they prefer to remain anonymous).
