# PredictX - Crypto Price Prediction Mini App

Replit'ten Vercel'e tam port. Tüm özellikler çalışıyor.

## Kurulum

```bash
# 1. Vercel'e deploy
vercel

# 2. Neon database connection string'i Vercel'e ekle
# Vercel Dashboard → Settings → Environment Variables
# DATABASE_URL = postgresql://...

# 3. Schema push
npm install
npm run db:push

# 4. Production deploy
git push
```

## Özellikler

✅ **Binance API** - Gerçek zamanlı fiyatlar  
✅ **Neon PostgreSQL** - Serverless database  
✅ **Drizzle ORM** - Type-safe queries  
✅ **Otomatik Kontrol** - Frontend her 30 saniyede kontrol eder  
✅ **Farcaster Frame v2** - Mini app entegrasyonu  
✅ **React + Vite** - Replit ile aynı  
✅ **Wouter routing** - Lightweight router  
✅ **Shadcn/ui** - Modern components  

## API Endpoints

- `GET /api/prices` - Fiyatlar
- `POST /api/predict` - Tahmin yap
- `GET /api/user-stats?fid=X` - Kullanıcı stats
- `GET /api/leaderboard` - Sıralama
- `GET /api/check-results?limit=10` - Sonuç kontrolü

## Otomatik Kontrol Sistemi

Vercel Hobby plan cron limiti yüzünden **frontend-based** kontrol:
- Her 30 saniyede `/api/check-results` çağrılır
- Maksimum 10 tahmin kontrol edilir
- Süresi dolan tahminler otomatik çözülür
- Skorlar güncellenir

## Environment Variables

```bash
DATABASE_URL=postgresql://...  # Neon connection string
NEXT_PUBLIC_APP_URL=https://predictx.vercel.app
NEXT_PUBLIC_FID=339972
```

## Geliştirme

```bash
npm install
npm run dev
```

## Database

Neon PostgreSQL (zaten kurulu):
- predictions
- user_stats  
- round_storage

Connection string Neon Console'dan al.
