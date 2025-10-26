import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= PREDICTIONS TABLE =============
export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey(),
  fid: integer("fid").notNull(),
  coinId: varchar("coin_id", { length: 20 }).notNull(), // 'bitcoin' | 'ethereum'
  challengeType: varchar("challenge_type", { length: 10 }).notNull(), // 'quick' | 'big'
  direction: varchar("direction", { length: 10 }).notNull(), // 'up' | 'down'
  
  // Prices
  startPrice: real("start_price").notNull(), // Price when user clicked predict
  currentPrice: real("current_price").notNull(), // Backward compatibility
  endPrice: real("end_price"), // Price when prediction expires
  predictedPrice: real("predicted_price"), // Optional exact price prediction
  targetPrice: real("target_price"), // Alias for endPrice
  
  // Timing
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  
  // Results
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending' | 'won' | 'lost' | 'expired'
  score: integer("score").default(0),
  earnedPoints: integer("earned_points").default(0),
  accuracy: real("accuracy").default(0),
  speedBonus: integer("speed_bonus").default(0),
  accuracyBonus: integer("accuracy_bonus").default(0),
  streakBonus: integer("streak_bonus").default(0),
  
  // Round system
  roundId: varchar("round_id", { length: 50 }),
  roundStartTime: bigint("round_start_time", { mode: "number" }),
  roundEndTime: bigint("round_end_time", { mode: "number" }),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;

// ============= USER STATS TABLE =============
export const userStats = pgTable("user_stats", {
  fid: integer("fid").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  pfpUrl: text("pfp_url"),
  
  // Scores
  totalScore: integer("total_score").default(0).notNull(),
  quickScore: integer("quick_score").default(0).notNull(),
  bigScore: integer("big_score").default(0).notNull(),
  
  // Prediction counts
  totalPredictions: integer("total_predictions").default(0).notNull(),
  quickPredictions: integer("quick_predictions").default(0).notNull(),
  bigPredictions: integer("big_predictions").default(0).notNull(),
  wonPredictions: integer("won_predictions").default(0).notNull(),
  lostPredictions: integer("lost_predictions").default(0).notNull(),
  pendingPredictions: integer("pending_predictions").default(0).notNull(),
  
  // Performance metrics
  winRate: real("win_rate").default(0).notNull(),
  averageAccuracy: real("average_accuracy").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  
  // Rankings
  rank: integer("rank").default(0).notNull(),
  quickRank: integer("quick_rank").default(0).notNull(),
  bigRank: integer("big_rank").default(0).notNull(),
  
  // Metadata
  lastPredictionAt: bigint("last_prediction_at", { mode: "number" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Daily Rewards
  lastDailyRewardAt: bigint("last_daily_reward_at", { mode: "number" }),
  dailyStreakDays: integer("daily_streak_days").default(0).notNull(),
  
  // Badges (JSON array)
  badges: jsonb("badges").default([]).notNull(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  updatedAt: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// ============= ROUND STORAGE TABLE =============
// For storing round-specific data (key-value store)
export const roundStorage = pgTable("round_storage", {
  key: varchar("key", { length: 200 }).primaryKey(),
  value: text("value").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoundStorageSchema = createInsertSchema(roundStorage).omit({
  createdAt: true,
});

export type InsertRoundStorage = z.infer<typeof insertRoundStorageSchema>;
export type RoundStorage = typeof roundStorage.$inferSelect;

// ============= TYPES (matching Next.js project) =============

export type CryptoId = 'bitcoin' | 'ethereum';
export type ChallengeType = 'quick' | 'big';
export type PredictionDirection = 'up' | 'down';
export type PredictionStatus = 'active' | 'pending' | 'won' | 'lost' | 'expired';

export interface CryptoPrice {
  id: CryptoId;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  lastUpdated: number;
}

export interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScoringConfig {
  quick: {
    baseScore: number;
    maxScore: number;
    maxStreakMultiplier: number;
  };
  big: {
    baseScore: number;
    maxScore: number;
    maxStreakMultiplier: number;
  };
  streakMultipliers: {
    0: number;   // No streak
    3: number;   // 3+ wins
    5: number;   // 5+ wins
    10: number;  // 10+ wins (max)
  };
}
