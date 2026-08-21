# Railpack / Railway Deployment Guide for Luma Finance

## Live App

**[https://luma-fi.vercel.app/](https://luma-fi.vercel.app/)** — Deployed on Vercel from `main` branch.


Railpack failed because:
1. No `start` script was defined in root `package.json`
2. No `railway.json` deployment config existed
3. The Vite static build output directory wasn't declared

## What Was Changed

### 1. `package.json` (root)
- `build` script now runs: `npm --prefix apps/web run build`
- Added `start` script: `serve apps/web/dist -s -l ${PORT:-3000}`
- Added `serve` as a dependency (`^14.2.3`)

### 2. `railway.json` (NEW — root level)
```json
{
  "build": {
    "buildCommand": "npm install && npm --prefix apps/web run build"
  },
  "deploy": {
    "startCommand": "npx serve apps/web/dist -s -l 3000"
  }
}
```

## Railway Environment Variables to Set

In Railway dashboard → Variables, set these:

| Variable | Value |
|----------|-------|
| `XLAYER_RPC_URL` | `https://rpc.xlayer.tech` |
| `XLAYER_CHAIN_ID` | `196` |
| `PORT` | `3000` |

> ⚠️ **NEVER set DEPLOYER_PRIVATE_KEY or TELEGRAM_BOT_TOKEN** in Railway env vars for the web app.
> Those are backend-only secrets.

## Deploy Steps

1. Push to GitHub: `git push origin main`
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select `OpeyemiMoses/Luma`
4. Railway auto-detects `railway.json` and deploys
5. Your site goes live at `https://luma-finance.up.railway.app` (or similar)
