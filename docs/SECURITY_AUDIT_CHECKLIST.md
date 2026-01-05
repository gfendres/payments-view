# Security Audit Checklist for Public Repository

Use this checklist before making the repository public to ensure no sensitive information is exposed.

## 🔍 Pre-Publication Security Audit

### Environment Variables & Secrets

- [ ] **No hardcoded secrets in code**

  ```bash
  # Search for potential secrets
  grep -r "api[_-]key" --exclude-dir=node_modules --exclude-dir=.git .
  grep -r "secret" --exclude-dir=node_modules --exclude-dir=.git .
  grep -r "password" --exclude-dir=node_modules --exclude-dir=.git .
  grep -r "token" --exclude-dir=node_modules --exclude-dir=.git .
  ```

- [ ] **No API keys in documentation**

  ```bash
  grep -r "sk-" docs/
  grep -r "pk_" docs/
  grep -r "AKIA" docs/
  ```

- [ ] **`.env.example` exists** with placeholder values only
- [ ] **All `.env*` files are in `.gitignore`**
- [ ] **No environment files committed** to git history

  ```bash
  git log --all --full-history --pretty=format:"%H" -- "*.env*" | head -5
  ```

### Git History

- [ ] **Review all commits** for accidentally committed secrets

  ```bash
  git log --all --oneline | head -50
  ```

- [ ] **Check for removed secrets** still in history

  ```bash
  git log --all --full-history --pretty=format:"%H" -- "*secret*" "*key*" | head -10
  ```

- [ ] **Use git-secrets or similar tool** (optional but recommended)

  ```bash
  # Install git-secrets
  # brew install git-secrets (macOS)
  # Run scan
  git secrets --scan-history
  ```

### Configuration Files

- [ ] **No production URLs** in code (use environment variables)
- [ ] **No internal server addresses** exposed
- [ ] **No database connection strings** hardcoded
- [ ] **No third-party service credentials** hardcoded
- [ ] **Vercel/deployment configs** reviewed for secrets

### Documentation

- [ ] **README.md** doesn't contain real API keys
- [ ] **SECURITY.md** exists with vulnerability reporting process
- [ ] **CONTRIBUTING.md** exists with contribution guidelines
- [ ] **LICENSE** file exists (MIT or chosen license)
- [ ] **CODE_OF_CONDUCT.md** exists
- [ ] All docs use **placeholder values** for sensitive data

### Dependencies

- [ ] **`package.json`** doesn't contain private packages
- [ ] **Lock files committed** (`bun.lock`)
- [ ] **Run security audit**

  ```bash
  bun audit
  ```

- [ ] **No vulnerable dependencies** (critical/high severity)
- [ ] **Dependabot enabled** for automated updates

### Code Quality

- [ ] **No commented-out secrets** in code
- [ ] **No debug/development tokens** in code
- [ ] **Logging doesn't expose secrets** (check logger config)
- [ ] **Error messages sanitized** (no stack traces with sensitive data)

### Infrastructure

- [ ] **`.github/` folder configured** with workflows
- [ ] **GitHub Actions secrets** set (not in code)
- [ ] **Branch protection rules** configured
- [ ] **Code scanning enabled** (CodeQL)
- [ ] **Secret scanning enabled** on GitHub
- [ ] **Dependabot alerts enabled**

### Files to Review

- [ ] `/package.json` - Check for private registries, tokens
- [ ] `/bun.lock` - Ensure no suspicious packages
- [ ] `/apps/web/next.config.ts` - No hardcoded URLs/keys
- [ ] `/packages/constants/src/config/` - All configs use env vars
- [ ] `/packages/infrastructure/` - No API keys in client code
- [ ] `/vercel.json` - No secrets in config
- [ ] All `*.config.*` files reviewed

### Git Ignore Verification

- [ ] `.gitignore` includes all environment files

  ```
  .env
  .env*.local
  *.secret
  .secrets/
  *.key
  *.pem
  ```

- [ ] `.gitignore` includes build artifacts

  ```
  node_modules
  .next/
  out/
  dist/
  build/
  ```

- [ ] Test that ignored files can't be committed

  ```bash
  echo "TEST_SECRET=abc123" > .env.local
  git add .env.local
  # Should fail or show warning
  ```

## 🔐 GitHub Repository Settings

### Before Making Public

- [ ] **Enable secret scanning** (Settings → Security → Code security)
- [ ] **Enable push protection** (prevents committing secrets)
- [ ] **Enable dependency graph**
- [ ] **Enable Dependabot alerts**
- [ ] **Enable Dependabot security updates**
- [ ] **Enable CodeQL code scanning**

### Branch Protection

- [ ] **Protect `main` branch**
  - Require pull request reviews (at least 1)
  - Require status checks to pass
  - Require conversation resolution
  - Restrict who can push
  - No force push allowed

- [ ] **Required status checks configured**
  - Lint
  - Type Check
  - Test
  - Build

### Repository Settings

- [ ] **Issues enabled** for bug reports
- [ ] **Discussions enabled** (optional)
- [ ] **Wiki disabled** (use docs/ instead)
- [ ] **Projects disabled** (optional)
- [ ] **Sponsorships configured** (optional)

## 📝 Documentation Completeness

- [ ] **README.md** has installation instructions
- [ ] **README.md** has environment variable documentation
- [ ] **README.md** has links to detailed docs
- [ ] **SECURITY.md** has responsible disclosure process
- [ ] **CONTRIBUTING.md** has contribution workflow
- [ ] **LICENSE** is appropriate (MIT recommended)
- [ ] **CODE_OF_CONDUCT.md** sets community standards

## 🧪 Final Verification

### Local Tests

- [ ] **Fresh clone test**

  ```bash
  cd /tmp
  git clone <your-repo-url>
  cd payments-view
  bun install
  # Should work without any .env.local
  ```

- [ ] **Build test**

  ```bash
  bun run build
  # Should fail gracefully with clear error about missing env vars
  ```

- [ ] **Lint and typecheck**

  ```bash
  bun run lint
  bun run typecheck
  # Should pass
  ```

### Security Scans

- [ ] **Run manual security scan**

  ```bash
  # Check for exposed secrets
  bun audit

  # Check git history
  git log --all --full-history -- "*.env*" "*.key" "*.pem"
  ```

- [ ] **Use online tools** (optional)
  - [GitGuardian](https://www.gitguardian.com/)
  - [TruffleHog](https://github.com/trufflesecurity/trufflehog)
  - [Gitleaks](https://github.com/gitleaks/gitleaks)

### GitHub Verification

- [ ] **Secret scanning results reviewed** (no alerts)
- [ ] **Security advisories checked** (no open issues)
- [ ] **Dependabot alerts reviewed** (no critical/high)
- [ ] **Code scanning results reviewed** (CodeQL)

## 🚀 Making Repository Public

### Final Steps

1. [ ] **Complete all checklist items above**
2. [ ] **Review with team member** (if available)
3. [ ] **Create backup** of private repository
4. [ ] **Go to Settings → Danger Zone → Change visibility**
5. [ ] **Click "Make Public"**
6. [ ] **Confirm by typing repository name**

### Immediately After Publishing

- [ ] **Verify all workflows run** (GitHub Actions)
- [ ] **Check security tab** for any new alerts
- [ ] **Monitor first few hours** for any issues reported
- [ ] **Announce on social media** (optional)
- [ ] **Submit to directories** (optional)
  - Awesome lists
  - Product Hunt
  - Hacker News

## 🔄 Ongoing Security Maintenance

### Weekly

- [ ] Review Dependabot PRs and merge updates
- [ ] Check security alerts
- [ ] Review open issues for security concerns

### Monthly

- [ ] Review and rotate API keys if needed
- [ ] Check for new CVEs affecting dependencies
- [ ] Review GitHub security advisories

### Quarterly

- [ ] Full security audit
- [ ] Review and update security documentation
- [ ] Test vulnerability reporting process
- [ ] Review access controls and permissions

## ⚠️ If Secrets Are Found in History

### Immediate Actions

1. **Revoke compromised credentials immediately**
   - API keys
   - Database passwords
   - Access tokens
   - Any exposed secrets

2. **Remove from git history** (use with caution)

   ```bash
   # Option 1: BFG Repo-Cleaner (recommended)
   bfg --delete-files .env.local
   bfg --replace-text passwords.txt

   # Option 2: git filter-branch (more complex)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (warning: destructive!)
   git push origin --force --all
   ```

3. **Notify affected parties**
   - Users if user data exposed
   - Service providers if their APIs compromised
   - GitHub Security (for serious incidents)

4. **Document the incident**
   - What was exposed
   - How long it was exposed
   - Actions taken
   - Lessons learned

## 📋 Checklist Summary

- **Total items**: ~80
- **Critical items** (must complete): ~40
- **Recommended items**: ~30
- **Optional items**: ~10

**Before making public, ensure all critical items are checked.**

---

**Last Updated**: January 2026

**Next Review**: Before making repository public
