import { NextResponse } from 'next/server';
import { getAllPredictions, getUserStats, updatePrediction, updateUserStats, getPendingResults } from '@/lib/simple-storage';
import { getCurrentPrice } from '@/lib/binance'; // Binance'e geçtik!
import { calculateAccuracy, isDirectionCorrect } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

function calculateScore(predictedPrice: number | undefined, actualPrice: number) {
  if (!predictedPrice) {
    return { score: 50, accuracy: 0 };
  }
  
  const accuracy = calculateAccuracy(predictedPrice, actualPrice);
  const baseScore = 100;
  const accuracyBonus = Math.round((accuracy / 100) * baseScore);
  const score = baseScore + accuracyBonus;
  
  return { score, accuracy };
}

export async function GET() {
  try {
    const predictions = await getAllPredictions();
    const now = Date.now();
    
    let checked = 0;
    let resolved = 0;

    for (const prediction of predictions) {
      if (prediction.status !== 'pending') continue;
      if (prediction.expiresAt > now) continue;

      checked++;

      const actualPrice = await getCurrentPrice(prediction.coinId);
      if (!actualPrice) {
        console.error(`Failed to get price for ${prediction.coinId}`);
        continue;
      }

      const stats = await getUserStats(prediction.fid);
      if (!stats) {
        console.error(`No stats found for user ${prediction.fid}`);
        continue;
      }

      const directionCorrect = isDirectionCorrect(
        prediction.direction,
        prediction.startPrice || prediction.currentPrice, // Kullanıcının butona bastığı fiyat
        actualPrice
      );

      if (directionCorrect) {
        prediction.status = 'won';
        
        const { score, accuracy } = calculateScore(prediction.predictedPrice, actualPrice);

        prediction.earnedPoints = score;
        prediction.score = score;
        prediction.accuracy = accuracy;
        prediction.endPrice = actualPrice; // Bitiş fiyatı
        prediction.targetPrice = actualPrice;

        stats.totalScore += score;
        stats.wonPredictions = (stats.wonPredictions || 0) + 1;
        stats.currentStreak = (stats.currentStreak || 0) + 1;
        
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }

        if (prediction.challengeType === 'quick') {
          stats.quickScore = (stats.quickScore || 0) + score;
          stats.quickPredictions = (stats.quickPredictions || 0) + 1;
        } else {
          stats.bigScore = (stats.bigScore || 0) + score;
          stats.bigPredictions = (stats.bigPredictions || 0) + 1;
        }
      } else {
        prediction.status = 'lost';
        prediction.endPrice = actualPrice; // Bitiş fiyatı
        prediction.targetPrice = actualPrice;
        prediction.earnedPoints = 0;
        stats.currentStreak = 0;
        stats.lostPredictions = (stats.lostPredictions || 0) + 1;
      }

      stats.totalPredictions += 1;
      stats.winRate = (stats.wonPredictions / stats.totalPredictions) * 100;

      const totalAccuracies = ((stats.averageAccuracy || 0) * (stats.totalPredictions - 1)) + (prediction.accuracy || 0);
      stats.averageAccuracy = totalAccuracies / stats.totalPredictions;

      await updatePrediction(prediction);
      await updateUserStats(stats);
      
      resolved++;
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${checked} predictions, resolved ${resolved}`,
      checked,
      resolved,
    });
  } catch (error) {
    console.error('Error checking results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check results' },
      { status: 500 }
    );
  }
}
