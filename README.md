# PredictX - Crypto Price Prediction Mini App

Replit'ten Vercel'e tam port. Tüm özellikler çalışıyor.

## Kurulum

```bash
# 1. Vercel'e deploy
vercel

# 2. Database ekle (Vercel Dashboard)
Storage → Create Database → Postgres (Neon)

# 3. Cron secret ekle
Settings → Environment Variables → CRON_SECRET

# 4. Schema push
npm run db:push

# 5. Production deploy
git push
```

## Özellikler

✅ Binance API (gerçek zamanlı fiyatlar)  
✅ Neon PostgreSQL (Vercel Marketplace)  
✅ Drizzle ORM (type-safe)  
✅ Vercel Cron (5 dakikada bir)  
✅ Farcaster Frame v2  
✅ React + Vite (Replit ile aynı)  
✅ Wouter routing  
✅ Shadcn/ui components  

## API Endpoints

- `/api/prices` - Fiyatlar
- `/api/predict` - Tahmin yap
- `/api/user-stats?fid=X` - Kullanıcı stats
- `/api/leaderboard` - Sıralama
- `/api/cron-check` - Otomatik kontrol (cron)

## Cron Job

Her 5 dakikada `/api/cron-check` çağrılır:
- Süresi dolan tahminleri kontrol eder
- Kazanan/kaybedenleri hesaplar
- Skorları günceller

`vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron-check",
    "schedule": "*/5 * * * *"
  }]
}
```

## Environment Variables

```
DATABASE_URL=      # Neon otomatik ekler
CRON_SECRET=       # 16+ karakter
```

## Geliştirme

```bash
npm install
npm run dev
```
