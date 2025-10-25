import { Prediction, ChallengeType, ScoringConfig } from './types';

export const SCORING: ScoringConfig = {
  quick: {
    baseScore: 50,
    maxSpeedBonus: 50,
    speedBonusWindow: 10,
    accuracyMultiplier: 2,
    perfectBonus: 100,
  },
  big: {
    baseScore: 200,
    maxSpeedBonus: 100,
    speedBonusWindow: 60,
    accuracyMultiplier: 5,
    perfectBonus: 500,
  },
  streakBonuses: {
    3: 50,
    5: 150,
    10: 500,
    20: 1500,
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

export function calculateSpeedBonus(
  challengeType: ChallengeType,
  submittedAt: number,
  createdAt: number
): number {
  const config = SCORING[challengeType];
  const elapsedSeconds = (submittedAt - createdAt) / 1000;
  
  if (elapsedSeconds > config.speedBonusWindow) {
    return 0;
  }
  
  const ratio = 1 - (elapsedSeconds / config.speedBonusWindow);
  return Math.round(config.maxSpeedBonus * ratio);
}

export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak >= 20) return SCORING.streakBonuses[20];
  if (currentStreak >= 10) return SCORING.streakBonuses[10];
  if (currentStreak >= 5) return SCORING.streakBonuses[5];
  if (currentStreak >= 3) return SCORING.streakBonuses[3];
  return 0;
}

export function calculateTotalScore(
  prediction: Prediction,
  targetPrice: number,
  currentStreak: number
): {
  totalScore: number;
  baseScore: number;
  speedBonus: number;
  accuracyBonus: number;
  streakBonus: number;
  isWin: boolean;
} {
  const config = SCORING[prediction.challengeType];
  
  const directionCorrect = isDirectionCorrect(
    prediction.direction,
    prediction.currentPrice,
    targetPrice
  );
  
  if (!directionCorrect) {
    return {
      totalScore: 0,
      baseScore: 0,
      speedBonus: 0,
      accuracyBonus: 0,
      streakBonus: 0,
      isWin: false,
    };
  }
  
  let baseScore = config.baseScore;
  let accuracyBonus = 0;
  
  if (prediction.predictedPrice) {
    const accuracy = calculateAccuracy(prediction.predictedPrice, targetPrice);
    
    if (accuracy >= 99.9) {
      accuracyBonus = config.perfectBonus;
    } else {
      const accuracyMultiplier = (accuracy / 100) * config.accuracyMultiplier;
      accuracyBonus = Math.round(baseScore * accuracyMultiplier);
    }
  }
  
  const speedBonus = calculateSpeedBonus(
    prediction.challengeType,
    prediction.timestamp,
    prediction.timestamp
  );
  
  const streakBonus = calculateStreakBonus(currentStreak + 1);
  
  const totalScore = baseScore + speedBonus + accuracyBonus + streakBonus;
  
  return {
    totalScore,
    baseScore,
    speedBonus,
    accuracyBonus,
    streakBonus,
    isWin: true,
  };
}

export function getScoreBreakdown(
  baseScore: number,
  speedBonus: number,
  accuracyBonus: number,
  streakBonus: number
): string[] {
  const breakdown: string[] = [];
  
  if (baseScore > 0) {
    breakdown.push(`Base: ${baseScore}`);
  }
  
  if (speedBonus > 0) {
    breakdown.push(`⚡ Speed: +${speedBonus}`);
  }
  
  if (accuracyBonus > 0) {
    breakdown.push(`🎯 Accuracy: +${accuracyBonus}`);
  }
  
  if (streakBonus > 0) {
    breakdown.push(`🔥 Streak: +${streakBonus}`);
  }
  
  return breakdown;
}
