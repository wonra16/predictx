#!/bin/bash
set -e

# Fix check-results route
sed -i 's/stats\.wonPredictions += 1/stats.wonPredictions = (stats.wonPredictions || 0) + 1/g' app/api/check-results/route.ts
sed -i 's/stats\.lostPredictions += 1/stats.lostPredictions = (stats.lostPredictions || 0) + 1/g' app/api/check-results/route.ts
sed -i 's/stats\.quickScore += score/stats.quickScore = (stats.quickScore || 0) + score/g' app/api/check-results/route.ts
sed -i 's/stats\.bigScore += score/stats.bigScore = (stats.bigScore || 0) + score/g' app/api/check-results/route.ts
sed -i 's/stats\.currentStreak += 1/stats.currentStreak = (stats.currentStreak || 0) + 1/g' app/api/check-results/route.ts
sed -i 's/(stats\.averageAccuracy \* (stats\.totalPredictions - 1))/((stats.averageAccuracy || 0) * (stats.totalPredictions - 1))/g' app/api/check-results/route.ts

# Fix cron-check route
sed -i 's/stats\.wonPredictions += 1/stats.wonPredictions = (stats.wonPredictions || 0) + 1/g' app/api/cron-check/route.ts
sed -i 's/stats\.lostPredictions += 1/stats.lostPredictions = (stats.lostPredictions || 0) + 1/g' app/api/cron-check/route.ts
sed -i 's/stats\.quickScore += score/stats.quickScore = (stats.quickScore || 0) + score/g' app/api/cron-check/route.ts
sed -i 's/stats\.bigScore += score/stats.bigScore = (stats.bigScore || 0) + score/g' app/api/cron-check/route.ts
sed -i 's/stats\.currentStreak += 1/stats.currentStreak = (stats.currentStreak || 0) + 1/g' app/api/cron-check/route.ts
sed -i 's/(stats\.averageAccuracy \* (stats\.totalPredictions - 1))/((stats.averageAccuracy || 0) * (stats.totalPredictions - 1))/g' app/api/cron-check/route.ts

echo "✅ All errors fixed!"
