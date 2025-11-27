# Vercel Deployment Checklist

Quick checklist for deploying to Vercel.

## ✅ Pre-Deployment

- [ ] Code is committed and pushed to Git repository
- [ ] All tests pass locally (`bun test`)
- [ ] Type checking passes (`bun run typecheck`)
- [ ] Linting passes (`bun run lint`)
- [ ] Build works locally (`bun run build`)

## ✅ Vercel Setup

- [ ] Create Vercel account (if needed)
- [ ] Connect Git repository to Vercel
- [ ] Configure project settings:
  - [ ] Root Directory: `apps/web`
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Build Command: `bun run build` (auto-detected)
  - [ ] Output Directory: `.next` (auto-detected)
  - [ ] Install Command: `bun install` (auto-detected)

## ✅ Environment Variables

- [ ] Set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (required)
  - Get from https://cloud.walletconnect.com/
- [ ] Set `NEXT_PUBLIC_GNO_PRICE_EUR` (optional)
- [ ] Set `OPENAI_API_KEY` (optional, for future AI features)

## ✅ Deploy

- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Verify deployment is successful
- [ ] Test the live application

## ✅ Post-Deployment

- [ ] Test wallet connection
- [ ] Test transaction list
- [ ] Test rewards page
- [ ] Verify all environment variables are working
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

## 🔍 Troubleshooting

If deployment fails:

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Ensure root directory** is set to `apps/web`
4. **Check Bun version** - Vercel should auto-detect from `packageManager` field
5. **Review error messages** in build output

## 📚 Documentation

For detailed deployment instructions, see [docs/deployment.md](./docs/deployment.md)

