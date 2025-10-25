// User types
export interface User {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

// Crypto types
export type CryptoId = 'bitcoin' | 'ethereum';

export interface CryptoPrice {
  id: CryptoId;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  lastUpdated: number;
}

// Challenge types
export type ChallengeType = 'quick' | 'big';
export type PredictionDirection = 'up' | 'down';

// Prediction types
export interface Prediction {
  id: string;
  fid: number;
  coinId: CryptoId;
  cryptoId?: CryptoId; // Alias for coinId
  challengeType: ChallengeType;
  direction: PredictionDirection;
  predictedPrice?: number;
  startPrice: number; // Kullanıcının butona bastığı andaki fiyat
  currentPrice: number; // Backward compatibility
  endPrice?: number; // Bet bittiğinde ki fiyat
  targetPrice?: number;
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'pending' | 'won' | 'lost' | 'expired';
  score?: number;
  earnedPoints?: number; // Kazanılan puan
  accuracy?: number;
  speedBonus?: number;
  accuracyBonus?: number;
  streakBonus?: number;
  roundId?: string; // Round bazlı sistem için
}

// Leaderboard types
export interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  totalScore: number;
  quickScore: number;
  bigScore: number;
  totalPredictions: number;
  wonPredictions: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

// User stats types
export interface UserStats {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  totalScore: number;
  quickScore: number;
  bigScore: number;
  totalPredictions: number;
  quickPredictions: number;
  bigPredictions: number;
  wonPredictions: number;
  lostPredictions: number;
  pendingPredictions: number;
  winRate: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  quickRank: number;
  bigRank: number;
  lastPredictionAt?: number;
  badges: Badge[];
}

// Badge types
export type BadgeType = 
  | 'first_prediction'
  | 'perfect_predictor'
  | 'streak_3'
  | 'streak_5'
  | 'streak_7'
  | 'streak_10'
  | 'streak_20'
  | 'streak_30'
  | 'quick_master'
  | 'big_champion'
  | 'speed_demon'
  | 'accuracy_king'
  | 'top_10'
  | 'top_100'
  | 'champion'
  | 'master'
  | 'legend';

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
}

// Scoring config
export interface ScoringConfig {
  quick: {
    baseScore: number;
    maxSpeedBonus: number;
    speedBonusWindow: number;
    accuracyMultiplier: number;
    perfectBonus: number;
  };
  big: {
    baseScore: number;
    maxSpeedBonus: number;
    speedBonusWindow: number;
    accuracyMultiplier: number;
    perfectBonus: number;
  };
  streakBonuses: {
    3: number;
    5: number;
    10: number;
    20: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Farcaster SDK types
export interface FarcasterContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  client: {
    added: boolean;
  };
}
