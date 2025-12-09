# GitHub Actions Deployment

This directory contains GitHub Actions workflows and configuration for automated deployment.

## Files

- `workflows/deploy.yml` - Main deployment workflow
- `SECRETS_TEMPLATE.md` - Template for required GitHub Secrets

## Quick Start

1. **Configure GitHub Secrets** (see `SECRETS_TEMPLATE.md`)
2. **Push to branch**:
   - `develop` → Deploys to staging
   - `main` → Deploys to production

## Required Secrets

The workflow requires these secrets to be configured in GitHub:

### Staging
- `APP_URL_STAGING`
- `API_URL_STAGING`
- `HOST_DNS_STAGING`
- `SERVER_SSH_KEY_STAGING`

### Production
- `APP_URL_PRODUCTION`
- `API_URL_PRODUCTION`
- `HOST_DNS_PRODUCTION`
- `SERVER_SSH_KEY_PRODUCTION`

### Optional
- `TURNSTILE_SITE_KEY`
- `CLARITY_PROJECT_ID`

**⚠️ Never commit secrets to the repository!**

See `SECRETS_TEMPLATE.md` for detailed configuration instructions.





