// Game Logic - Scoring, Predictions, Badges
import { Prediction, UserStats, Badge, BadgeType } from '@shared/schema';

// ============= SCORING SYSTEM =============

export function calculateAccuracy(predictedPrice: number, actualPrice: number): number {
  const difference = Math.abs(predictedPrice - actualPrice);
  const percentageDiff = (difference / actualPrice) * 100;
  
  // Perfect prediction within 0.5%
  if (percentageDiff <= 0.5) return 100;
  // Excellent within 1%
  if (percentageDiff <= 1) return 90;
  // Great within 2%
  if (percentageDiff <= 2) return 75;
  // Good within 3%
  if (percentageDiff <= 3) return 60;
  // Okay within 5%
  if (percentageDiff <= 5) return 40;
  // Not bad within 10%
  if (percentageDiff <= 10) return 20;
  // Miss
  return 0;
}

export function calculateScore(accuracy: number): number {
  // Base score from accuracy
  let score = accuracy;
  
  // Bonus for high accuracy
  if (accuracy >= 90) {
    score += 10; // Perfect/Excellent bonus
  }
  
  return Math.round(score);
}

export function isDirectionCorrect(
  direction: 'up' | 'down',
  startPrice: number,
  endPrice: number
): boolean {
  const priceChange = endPrice - startPrice;
  
  if (direction === 'up') {
    return priceChange > 0;
  } else {
    return priceChange < 0;
  }
}

// ============= PREDICTION HELPERS =============

export function getPredictionStatus(prediction: Prediction, currentTime: number): string {
  if (prediction.status !== 'pending') {
    return prediction.status;
  }
  
  if (prediction.expiresAt <= currentTime) {
    return 'checking';
  }
  
  return 'pending';
}

export function getTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

export function getPredictionGrade(accuracy: number): {
  grade: string;
  color: string;
  emoji: string;
} {
  if (accuracy >= 90) {
    return { grade: 'PERFECT!', color: 'text-green-400', emoji: '🎯' };
  }
  if (accuracy >= 75) {
    return { grade: 'EXCELLENT!', color: 'text-green-300', emoji: '⭐' };
  }
  if (accuracy >= 60) {
    return { grade: 'GREAT!', color: 'text-blue-400', emoji: '🔥' };
  }
  if (accuracy >= 40) {
    return { grade: 'GOOD!', color: 'text-blue-300', emoji: '👍' };
  }
  if (accuracy >= 20) {
    return { grade: 'OKAY', color: 'text-yellow-400', emoji: '👌' };
  }
  if (accuracy > 0) {
    return { grade: 'NOT BAD', color: 'text-orange-400', emoji: '🤔' };
  }
  return { grade: 'MISS', color: 'text-red-400', emoji: '❌' };
}

// ============= STATS CALCULATIONS =============

export function updateStatsAfterPrediction(
  stats: UserStats,
  prediction: Prediction,
  won: boolean
): UserStats {
  const newStats = { ...stats };
  
  newStats.totalPredictions += 1;
  
  if (won) {
    newStats.wonPredictions += 1;
    newStats.currentStreak += 1;
    
    if (newStats.currentStreak > newStats.longestStreak) {
      newStats.longestStreak = newStats.currentStreak;
    }
    
    if (prediction.score) {
      newStats.totalScore += prediction.score;
    }
  } else {
    newStats.lostPredictions += 1;
    newStats.currentStreak = 0;
  }
  
  newStats.winRate = (newStats.wonPredictions / newStats.totalPredictions) * 100;
  
  if (prediction.accuracy) {
    const totalAccuracy = newStats.averageAccuracy * (newStats.totalPredictions - 1) + prediction.accuracy;
    newStats.averageAccuracy = totalAccuracy / newStats.totalPredictions;
  }
  
  return newStats;
}

// ============= BADGE SYSTEM =============

const BADGE_DEFINITIONS: Record<BadgeType, { name: string; description: string; icon: string }> = {
  first_prediction: {
    name: 'First Steps',
    description: 'Made your first prediction',
    icon: '🎯',
  },
  perfect_predictor: {
    name: 'Perfect Predictor',
    description: 'Score 100 points on a prediction',
    icon: '💯',
  },
  streak_3: {
    name: '3-Win Streak',
    description: 'Win 3 predictions in a row',
    icon: '🔥',
  },
  streak_5: {
    name: '5-Win Streak',
    description: 'Win 5 predictions in a row',
    icon: '🔥',
  },
  streak_7: {
    name: '7-Win Streak',
    description: 'Win 7 predictions in a row',
    icon: '🔥🔥',
  },
  streak_10: {
    name: '10-Win Streak',
    description: 'Win 10 predictions in a row',
    icon: '🔥🔥',
  },
  streak_20: {
    name: '20-Win Streak',
    description: 'Win 20 predictions in a row',
    icon: '🔥🔥🔥',
  },
  streak_30: {
    name: '30-Win Streak',
    description: 'Win 30 predictions in a row',
    icon: '🔥🔥🔥',
  },
  quick_master: {
    name: 'Quick Master',
    description: 'Win 50 quick challenges',
    icon: '⚡',
  },
  big_champion: {
    name: 'Big Champion',
    description: 'Win 50 big challenges',
    icon: '👑',
  },
  speed_demon: {
    name: 'Speed Demon',
    description: 'Get max speed bonus 10 times',
    icon: '💨',
  },
  accuracy_king: {
    name: 'Accuracy King',
    description: 'Get perfect accuracy 5 times',
    icon: '🎯',
  },
  top_10: {
    name: 'Top 10',
    description: 'Reach top 10 on leaderboard',
    icon: '🏅',
  },
  top_100: {
    name: 'Top 100',
    description: 'Reach top 100 on leaderboard',
    icon: '🏆',
  },
  champion: {
    name: 'Champion',
    description: 'Win 100 predictions',
    icon: '👑',
  },
  master: {
    name: 'Master',
    description: 'Reach 10,000 total score',
    icon: '⭐',
  },
  legend: {
    name: 'Legend',
    description: 'Reach #1 on leaderboard',
    icon: '🌟',
  },
};

export function checkForNewBadges(stats: UserStats): Badge[] {
  const newBadges: Badge[] = [];
  const existingBadges = Array.isArray(stats.badges) ? stats.badges as Badge[] : [];
  const existingBadgeTypes = existingBadges.map((b) => b.type);
  const now = Date.now();
  
  // First prediction
  if (!existingBadgeTypes.includes('first_prediction') && stats.totalPredictions >= 1) {
    newBadges.push(createBadge('first_prediction', now));
  }
  
  // Streak badges
  if (!existingBadgeTypes.includes('streak_30') && stats.currentStreak >= 30) {
    newBadges.push(createBadge('streak_30', now));
  } else if (!existingBadgeTypes.includes('streak_20') && stats.currentStreak >= 20) {
    newBadges.push(createBadge('streak_20', now));
  } else if (!existingBadgeTypes.includes('streak_10') && stats.currentStreak >= 10) {
    newBadges.push(createBadge('streak_10', now));
  } else if (!existingBadgeTypes.includes('streak_7') && stats.currentStreak >= 7) {
    newBadges.push(createBadge('streak_7', now));
  } else if (!existingBadgeTypes.includes('streak_5') && stats.currentStreak >= 5) {
    newBadges.push(createBadge('streak_5', now));
  } else if (!existingBadgeTypes.includes('streak_3') && stats.currentStreak >= 3) {
    newBadges.push(createBadge('streak_3', now));
  }
  
  // Score badges
  if (!existingBadgeTypes.includes('master') && stats.totalScore >= 10000) {
    newBadges.push(createBadge('master', now));
  }
  
  // Win count badges
  if (!existingBadgeTypes.includes('champion') && stats.wonPredictions >= 100) {
    newBadges.push(createBadge('champion', now));
  }
  
  // Rank badges
  if (!existingBadgeTypes.includes('legend') && stats.rank === 1) {
    newBadges.push(createBadge('legend', now));
  } else if (!existingBadgeTypes.includes('top_10') && stats.rank <= 10) {
    newBadges.push(createBadge('top_10', now));
  } else if (!existingBadgeTypes.includes('top_100') && stats.rank <= 100) {
    newBadges.push(createBadge('top_100', now));
  }
  
  return newBadges;
}

function createBadge(type: BadgeType, earnedAt: number): Badge {
  const definition = BADGE_DEFINITIONS[type];
  return {
    type,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    earnedAt,
  };
}

export function getBadgeInfo(type: BadgeType) {
  return BADGE_DEFINITIONS[type];
}

// ============= LEADERBOARD HELPERS =============

export function formatRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 10) return '🔥🔥';
  if (streak >= 3) return '🔥';
  return '';
}
