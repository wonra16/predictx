# PredictX

Crypto prediction game on Farcaster

## Quick Setup

1. **Supabase**
   - Go to supabase.com
   - Create new project
   - Run `supabase-schema.sql` in SQL Editor
   - Get API keys from Settings > API

2. **Vercel**
   - Import GitHub repo: wonra16/predictx
   - Add environment variables (see below)
   - Deploy

3. **Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://predictx.vercel.app
```

## Deploy
```bash
git push origin main
```
Vercel auto-deploys!
