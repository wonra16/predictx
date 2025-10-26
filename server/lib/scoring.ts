// Scoring System
import { ScoringConfig, ChallengeType, Prediction } from '@shared/schema';

export const SCORING: ScoringConfig = {
  quick: {
    baseScore: 50,        // Minimum points (no streak)
    maxScore: 200,        // Maximum points (max streak)
    maxStreakMultiplier: 4,  // 4x multiplier at max streak
  },
  big: {
    baseScore: 200,       // Minimum points (no streak)
    maxScore: 1000,       // Maximum points (max streak)
    maxStreakMultiplier: 5,  // 5x multiplier at max streak
  },
  streakMultipliers: {
    0: 1.0,    // No streak: base points
    3: 1.5,    // 3+ streak: 1.5x
    5: 2.0,    // 5+ streak: 2x
    10: 4.0,   // 10+ streak: 4x for quick
  },
};

export const CHALLENGE_DURATIONS = {
  quick: 5 * 60 * 1000,
  big: 24 * 60 * 60 * 1000,
};

export function isDirectionCorrect(
  direction: 'up' | 'down',
  startPrice: number,
  endPrice: number
): boolean {
  const priceChange = endPrice - startPrice;
  return direction === 'up' ? priceChange > 0 : priceChange < 0;
}

export function calculateAccuracy(
  predictedPrice: number,
  actualPrice: number
): number {
  const difference = Math.abs(predictedPrice - actualPrice);
  const percentageDiff = (difference / actualPrice) * 100;
  const accuracy = Math.max(0, 100 - percentageDiff);
  return Math.round(accuracy * 100) / 100;
}

export function getStreakMultiplier(currentStreak: number): number {
  if (currentStreak >= 10) return SCORING.streakMultipliers[10];
  if (currentStreak >= 5) return SCORING.streakMultipliers[5];
  if (currentStreak >= 3) return SCORING.streakMultipliers[3];
  return SCORING.streakMultipliers[0];
}

export function calculateStreakBonus(
  challengeType: ChallengeType,
  currentStreak: number
): number {
  const config = SCORING[challengeType];
  let multiplier = getStreakMultiplier(currentStreak);
  
  // Big challenge has 5x max multiplier (1000 points)
  if (challengeType === 'big' && multiplier >= 4.0) {
    multiplier = 5.0;
  }
  
  // Calculate score with streak multiplier
  const scoreWithStreak = Math.round(config.baseScore * multiplier);
  
  // Cap at maxScore
  return Math.min(scoreWithStreak, config.maxScore);
}

export function calculateTotalScore(
  prediction: Prediction,
  targetPrice: number,
  currentStreak: number
): {
  totalScore: number;
  baseScore: number;
  streakMultiplier: number;
  streakBonus: number;
  isWin: boolean;
} {
  const directionCorrect = isDirectionCorrect(
    prediction.direction as 'up' | 'down',
    prediction.currentPrice,
    targetPrice
  );
  
  if (!directionCorrect) {
    return {
      totalScore: 0,
      baseScore: 0,
      streakMultiplier: 1,
      streakBonus: 0,
      isWin: false,
    };
  }
  
  // Calculate score based on streak (this will be the new streak after win)
  const newStreak = currentStreak + 1;
  const streakMultiplier = getStreakMultiplier(newStreak);
  const challengeType = prediction.challengeType as ChallengeType;
  const totalScore = calculateStreakBonus(challengeType, newStreak);
  
  const config = SCORING[challengeType];
  
  return {
    totalScore,
    baseScore: config.baseScore,
    streakMultiplier,
    streakBonus: totalScore - config.baseScore,
    isWin: true,
  };
}

export function getScoreBreakdown(
  baseScore: number,
  streakMultiplier: number,
  streakBonus: number
): string[] {
  const breakdown: string[] = [];
  
  if (baseScore > 0) {
    breakdown.push(`Base: ${baseScore}`);
  }
  
  if (streakMultiplier > 1) {
    breakdown.push(`🔥 ${streakMultiplier}x Streak: +${streakBonus}`);
  }
  
  return breakdown;
}
