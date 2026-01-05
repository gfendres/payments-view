# GitHub Repository Rulesets Configuration

This document describes the configured GitHub rulesets and branch protection for this repository.

## ✅ Current Configuration

The repository has been configured with the following protection rules.

### Active Rulesets

View at: [Settings → Rules → Rulesets](https://github.com/gfendres/payments-view/settings/rules)

---

## 📋 Configuration Details

---

## Ruleset 1: Main Branch Protection

**Name:** `Protect main branch`

**Target branches:** `main`

**Enforcement status:** Active

### Rules

#### 1. Restrict deletions
- ✅ Enabled
- Prevents the main branch from being deleted

#### 2. Require a pull request before merging
- ✅ Enabled
- **Required approvals:** 1 (for external contributors)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ⚠️ Require review from Code Owners (optional for solo maintainer)
- ❌ Require approval of the most recent reviewable push
- ✅ Require conversation resolution before merging

> **Note**: As a solo maintainer, you can allow yourself to bypass these for your own PRs, but they'll apply to external contributions.

#### 3. Require status checks to pass
- ✅ Enabled
- ✅ Require branches to be up to date before merging

**Required status checks:**
- `Lint`
- `Type Check`
- `Test`
- `Build`
- `All Checks Passed`

#### 4. Block force pushes
- ✅ Enabled
- Prevents force pushes to the main branch

#### 5. Require signed commits
- ⚠️ Optional but recommended
- Ensures all commits are signed with GPG

#### 6. Require linear history
- ✅ Enabled
- Prevents merge commits, requires rebase or squash

---

## Ruleset 2: Develop Branch Protection

**Name:** `Protect develop branch`

**Target branches:** `develop`

**Enforcement status:** Active

### Rules

#### 1. Restrict deletions
- ✅ Enabled

#### 2. Require a pull request before merging
- ✅ Enabled
- **Required approvals:** 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ❌ Require review from Code Owners (optional for develop)
- ✅ Require conversation resolution before merging

#### 3. Require status checks to pass
- ✅ Enabled
- ✅ Require branches to be up to date before merging

**Required status checks:**
- `Lint`
- `Type Check`
- `Test`
- `Build`

#### 4. Block force pushes
- ✅ Enabled

---

## Ruleset 3: Release Branch Protection

**Name:** `Protect release branches`

**Target branches:** `release/*`

**Enforcement status:** Active

### Rules

#### 1. Restrict deletions
- ✅ Enabled

#### 2. Require a pull request before merging
- ✅ Enabled
- **Required approvals:** 2
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners
- ✅ Require conversation resolution before merging

#### 3. Require status checks to pass
- ✅ Enabled
- ✅ Require branches to be up to date before merging

**Required status checks:**
- `Lint`
- `Type Check`
- `Test`
- `Build`
- `All Checks Passed`

#### 4. Block force pushes
- ✅ Enabled

#### 5. Require signed commits
- ✅ Enabled (recommended for releases)

---

## Ruleset 4: Tag Protection

**Name:** `Protect version tags`

**Target tags:** `v*`

**Enforcement status:** Active

### Rules

#### 1. Restrict deletions
- ✅ Enabled
- Prevents version tags from being deleted

#### 2. Restrict updates
- ✅ Enabled
- Prevents tags from being updated after creation

---

## Additional Repository Settings

### Branch Protection (Legacy - if not using Rulesets)

If your GitHub plan doesn't support Rulesets, configure these settings under **Settings** → **Branches** → **Branch protection rules**:

#### Main Branch

- ✅ Require a pull request before merging
  - Required approving reviews: 1
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners
- ✅ Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Status checks: `Lint`, `Type Check`, `Test`, `Build`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches
  - Only allow administrators

### Security Settings

Navigate to **Settings** → **Security**:

#### Code security and analysis

- ✅ **Dependency graph**: Enabled
- ✅ **Dependabot alerts**: Enabled
- ✅ **Dependabot security updates**: Enabled
- ✅ **Dependabot version updates**: Enabled (configure with `.github/dependabot.yml`)
- ✅ **Code scanning**: Enabled (CodeQL)
- ✅ **Secret scanning**: Enabled
- ✅ **Push protection**: Enabled (prevents committing secrets)

### General Settings

Navigate to **Settings** → **General**:

#### Pull Requests

- ✅ Allow squash merging
  - Default to pull request title and commit details
- ❌ Allow merge commits (disabled for linear history)
- ✅ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

#### Features

- ✅ Issues
- ✅ Discussions (recommended for community)
- ❌ Projects (optional)
- ❌ Wiki (use docs/ folder instead)

---

## Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "gfendres"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    reviewers:
      - "gfendres"
    labels:
      - "dependencies"
      - "github-actions"
```

---

## Enforcement Levels

### For Open Source Projects

- **Main branch**: Strict enforcement (no bypassing)
- **Develop branch**: Standard enforcement
- **Feature branches**: No restrictions

### For Private Development

- **Main branch**: Strict enforcement
- **Develop branch**: Strict enforcement
- **Release branches**: Strict enforcement
- **Feature branches**: No restrictions

---

## Testing Rulesets

After configuring rulesets:

1. Create a test branch: `git checkout -b test/ruleset-validation`
2. Make a small change and commit
3. Push and open a PR to main
4. Verify that:
   - CI checks are required
   - At least 1 approval is required
   - Force push is blocked
   - Direct push to main is blocked

---

## Troubleshooting

### Status checks not appearing

- Ensure the workflow has run at least once on the main branch
- Check that workflow names match exactly in the ruleset configuration
- Wait a few minutes for GitHub to sync status checks

### Can't merge despite passing checks

- Ensure branch is up to date with base branch
- Check that all conversations are resolved
- Verify all required reviewers have approved

### Bypass protection for emergencies

Only repository administrators can bypass protections:

1. Go to the PR
2. Click "Merge" dropdown
3. Select "Merge without waiting for requirements" (admin only)
4. Document the reason for bypass in the PR

---

## Maintenance

Review and update rulesets:

- **Quarterly**: Review effectiveness of current rules
- **After incidents**: Adjust rules based on lessons learned
- **When adding CI checks**: Update required status checks
- **Team growth**: Adjust required approvals count

---

**Last Updated:** January 2026

