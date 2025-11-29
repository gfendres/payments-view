# Deployment Guide - Vercel

This guide covers deploying the Gnosis Card Portfolio Dashboard to Vercel.

## Prerequisites

- Vercel account (sign up at <https://vercel.com>)
- GitHub/GitLab/Bitbucket repository with your code
- WalletConnect Project ID (get one at <https://cloud.walletconnect.com/>)

## Quick Start

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the Next.js app

### 2. Configure Project Settings

Vercel should automatically detect:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web` (set this manually if not detected)
- **Build Command**: `bun run build` (runs `next build` from apps/web)
- **Output Directory**: `.next` (default, no need to change)
- **Install Command**: `bun install` (runs from repository root automatically)

### 3. Set Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required Variables

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

Get your WalletConnect Project ID:

1. Go to <https://cloud.walletconnect.com/>
2. Create a new project or use an existing one
3. Copy the Project ID
4. Add it to Vercel environment variables

#### Optional Variables

```bash
# GNO Price in EUR (for rewards calculations)
# If not set, rewards page will show placeholder values
NEXT_PUBLIC_GNO_PRICE_EUR=250.00

# OpenAI API Key (for future AI features)
# Only needed if you plan to use AI insights
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Note**: `NODE_ENV` is automatically set to `production` by Vercel, no need to configure it.

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Configuration Details

### Monorepo Setup

The project uses a Bun monorepo with workspaces. Vercel is configured to:

- **Root Directory**: `apps/web` - Tells Vercel where the Next.js app lives
- **Build Command**: Builds all workspace dependencies first, then the web app
- **Install Command**: Uses `bun install` to install all workspace dependencies

### Build Process

1. Vercel runs `bun install` from the repository root
   - This installs all dependencies for all workspaces
2. Vercel runs the build command from `apps/web`
   - This builds all workspace packages first
   - Then builds the Next.js application
3. Vercel deploys the `.next` output directory

### Ignore Command

The `ignoreCommand` in `vercel.json` tells Vercel to skip deployments when only non-relevant files change:

```bash
git diff --quiet HEAD^ HEAD -- apps/web packages
```

This means:

- Deploy if changes are in `apps/web` or `packages/`
- Skip deployment if changes are only in `docs/`, `.github/`, etc.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | ✅ Yes | WalletConnect project ID for wallet connections | `abc123def456...` |
| `NEXT_PUBLIC_GNO_PRICE_EUR` | ❌ No | GNO token price in EUR for rewards calculations | `250.00` |
| `OPENAI_API_KEY` | ❌ No | OpenAI API key for AI insights (future feature) | `sk-...` |
| `NODE_ENV` | ❌ No | Automatically set to `production` by Vercel | `production` |

### Setting Environment Variables in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`)
   - **Value**: Variable value
   - **Environment**: Select which environments (Production, Preview, Development)
4. Click "Save"

**Important**: After adding/updating environment variables, you need to redeploy for changes to take effect.

## Security Headers

The `vercel.json` includes security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

These are automatically applied to all routes.

## Custom Domain

To use a custom domain:

1. Go to your project settings
2. Navigate to "Domains"
3. Add your domain
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Build Fails with "Cannot find module"

**Problem**: Workspace dependencies not resolving

**Solution**:

- Ensure `rootDirectory` is set to `apps/web` in Vercel settings
- Verify `buildCommand` includes `bun install` before the build
- Check that all workspace packages have valid `package.json` files

### Environment Variables Not Working

**Problem**: `process.env.NEXT_PUBLIC_*` variables are undefined

**Solution**:

- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for the correct environment (Production/Preview/Development)

### Build Timeout

**Problem**: Build exceeds Vercel's timeout limit

**Solution**:

- Optimize build by checking for unnecessary dependencies
- Consider using Vercel Pro for longer build times
- Check if all workspace packages are building unnecessarily

### Bun Not Found

**Problem**: Vercel can't find `bun` command

**Solution**:

- Vercel should auto-detect Bun if `packageManager` is set in `package.json`
- Verify `"packageManager": "bun@1.1.38"` in root `package.json`
- If issues persist, you may need to use Node.js instead (not recommended)

## CI/CD Integration

### Automatic Deployments

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches
- **Development**: Pull request previews

### Manual Deployments

You can trigger manual deployments from:

- Vercel Dashboard → Deployments → "Redeploy"
- Vercel CLI: `vercel --prod`

## Monitoring

### Build Logs

View build logs in:

- Vercel Dashboard → Deployments → Select deployment → "Build Logs"

### Runtime Logs

View runtime logs in:

- Vercel Dashboard → Deployments → Select deployment → "Function Logs"

### Analytics

Enable Vercel Analytics:

1. Go to project settings
2. Navigate to "Analytics"
3. Enable "Web Analytics"

## Performance Optimization

### Edge Functions

Consider moving API routes to Edge Functions for better performance:

- Update `vercel.json` to include edge runtime configuration
- Move tRPC routes to Edge-compatible code

### Caching

Vercel automatically caches:

- Static assets
- Next.js build output
- Edge function responses

### Image Optimization

Next.js Image component automatically optimizes images through Vercel's Image Optimization API.

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the deployment you want to rollback to
3. Click the three dots menu
4. Select "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Bun Documentation](https://bun.sh/docs)
- [Monorepo Deployment Guide](https://vercel.com/docs/monorepos)

---

## Last Updated

November 2024
