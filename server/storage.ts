import { db } from "./db";
import { predictions, userStats, roundStorage, type Prediction, type UserStats, type InsertPrediction, type InsertUserStats, type LeaderboardEntry } from "@shared/schema";
import { eq, desc, and, lte, sql } from "drizzle-orm";

// ============= STORAGE INTERFACE =============

export interface IStorage {
  // Predictions
  savePrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPrediction(id: string): Promise<Prediction | null>;
  updatePrediction(id: string, updates: Partial<Prediction>): Promise<Prediction | null>;
  getUserPredictions(fid: number, limit?: number): Promise<Prediction[]>;
  getActivePrediction(fid: number): Promise<Prediction | null>;
  getPredictionInRound(fid: number, roundId: string): Promise<Prediction | null>;
  getPendingResults(limit?: number): Promise<Prediction[]>;
  
  // User Stats
  getUserStats(fid: number): Promise<UserStats | null>;
  updateUserStats(stats: InsertUserStats): Promise<UserStats>;
  initializeUserStats(fid: number, username: string, displayName: string, pfpUrl: string): Promise<UserStats>;
  claimDailyReward(fid: number): Promise<{ success: boolean; points: number; streakDays: number; alreadyClaimed?: boolean }>;
  
  // Leaderboard
  getLeaderboard(type?: 'total' | 'quick' | 'big', limit?: number): Promise<LeaderboardEntry[]>;
  getUserRank(fid: number): Promise<number>;
  
  // Round Storage
  getRoundData(key: string): Promise<string | null>;
  setRoundData(key: string, value: string, ttl?: number): Promise<void>;
  deleteRoundData(key: string): Promise<void>;
}

// ============= POSTGRESQL STORAGE IMPLEMENTATION =============

class PostgresStorage implements IStorage {
  
  // ============= PREDICTIONS =============
  
  async savePrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const [result] = await db.insert(predictions).values({
      id,
      ...prediction,
    }).returning();
    return result;
  }
  
  async getPrediction(id: string): Promise<Prediction | null> {
    const [result] = await db.select().from(predictions).where(eq(predictions.id, id)).limit(1);
    return result || null;
  }
  
  async updatePrediction(id: string, updates: Partial<Prediction>): Promise<Prediction | null> {
    const [result] = await db.update(predictions)
      .set(updates)
      .where(eq(predictions.id, id))
      .returning();
    return result || null;
  }
  
  async getUserPredictions(fid: number, limit: number = 10): Promise<Prediction[]> {
    return await db.select()
      .from(predictions)
      .where(eq(predictions.fid, fid))
      .orderBy(desc(predictions.timestamp))
      .limit(limit);
  }
  
  async getActivePrediction(fid: number): Promise<Prediction | null> {
    const now = Date.now();
    const [result] = await db.select()
      .from(predictions)
      .where(
        and(
          eq(predictions.fid, fid),
          eq(predictions.status, 'pending'),
          sql`${predictions.expiresAt} > ${now}`
        )
      )
      .orderBy(desc(predictions.timestamp))
      .limit(1);
    return result || null;
  }
  
  async getPredictionInRound(fid: number, roundId: string): Promise<Prediction | null> {
    const [result] = await db.select()
      .from(predictions)
      .where(
        and(
          eq(predictions.fid, fid),
          eq(predictions.roundId, roundId)
        )
      )
      .limit(1);
    return result || null;
  }
  
  async getPendingResults(limit: number = 100): Promise<Prediction[]> {
    const now = Date.now();
    return await db.select()
      .from(predictions)
      .where(
        and(
          eq(predictions.status, 'pending'),
          lte(predictions.expiresAt, now)
        )
      )
      .orderBy(predictions.expiresAt)
      .limit(limit);
  }
  
  // ============= USER STATS =============
  
  async getUserStats(fid: number): Promise<UserStats | null> {
    const [result] = await db.select()
      .from(userStats)
      .where(eq(userStats.fid, fid))
      .limit(1);
    return result || null;
  }
  
  async updateUserStats(stats: InsertUserStats): Promise<UserStats> {
    const existing = await this.getUserStats(stats.fid);
    
    if (existing) {
      const [result] = await db.update(userStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(userStats.fid, stats.fid))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(userStats)
        .values(stats)
        .returning();
      return result;
    }
  }
  
  async initializeUserStats(
    fid: number,
    username: string,
    displayName: string,
    pfpUrl: string
  ): Promise<UserStats> {
    const existing = await this.getUserStats(fid);
    if (existing) {
      return existing;
    }
    
    const [result] = await db.insert(userStats).values({
      fid,
      username,
      displayName,
      pfpUrl,
      totalScore: 0,
      quickScore: 0,
      bigScore: 0,
      totalPredictions: 0,
      quickPredictions: 0,
      bigPredictions: 0,
      wonPredictions: 0,
      lostPredictions: 0,
      pendingPredictions: 0,
      winRate: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      rank: 0,
      quickRank: 0,
      bigRank: 0,
      badges: [],
    }).returning();
    
    return result;
  }
  
  async claimDailyReward(fid: number): Promise<{ success: boolean; points: number; streakDays: number; alreadyClaimed?: boolean }> {
    const stats = await this.getUserStats(fid);
    if (!stats) {
      return { success: false, points: 0, streakDays: 0 };
    }
    
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // Check if already claimed today
    if (stats.lastDailyRewardAt && stats.lastDailyRewardAt >= todayTimestamp) {
      return { 
        success: false, 
        points: 0, 
        streakDays: stats.dailyStreakDays,
        alreadyClaimed: true 
      };
    }
    
    // Calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTimestamp = yesterday.getTime();
    
    let newStreakDays = 1;
    if (stats.lastDailyRewardAt && stats.lastDailyRewardAt >= yesterdayTimestamp) {
      // Claimed yesterday, increment streak
      newStreakDays = stats.dailyStreakDays + 1;
    }
    
    // Calculate points (100 base + streak bonus)
    const basePoints = 100;
    const streakBonus = Math.min((newStreakDays - 1) * 10, 200); // Max 200 bonus
    const totalPoints = basePoints + streakBonus;
    
    // Update stats
    await db.update(userStats)
      .set({
        totalScore: stats.totalScore + totalPoints,
        lastDailyRewardAt: now,
        dailyStreakDays: newStreakDays,
      })
      .where(eq(userStats.fid, fid));
    
    return { 
      success: true, 
      points: totalPoints, 
      streakDays: newStreakDays 
    };
  }
  
  // ============= LEADERBOARD =============
  
  async getLeaderboard(
    type: 'total' | 'quick' | 'big' = 'total',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    const scoreColumn = type === 'quick' 
      ? userStats.quickScore 
      : type === 'big' 
      ? userStats.bigScore 
      : userStats.totalScore;
    
    const results = await db.select()
      .from(userStats)
      .orderBy(desc(scoreColumn))
      .limit(limit);
    
    return results.map((stats, index) => ({
      fid: stats.fid,
      username: stats.username,
      displayName: stats.displayName,
      pfpUrl: stats.pfpUrl,
      totalScore: stats.totalScore,
      quickScore: stats.quickScore,
      bigScore: stats.bigScore,
      totalPredictions: stats.totalPredictions,
      wonPredictions: stats.wonPredictions,
      winRate: stats.winRate,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      rank: index + 1,
    }));
  }
  
  async getUserRank(fid: number): Promise<number> {
    const allUsers = await db.select()
      .from(userStats)
      .orderBy(desc(userStats.totalScore));
    
    const index = allUsers.findIndex(u => u.fid === fid);
    return index !== -1 ? index + 1 : 0;
  }
  
  // ============= ROUND STORAGE =============
  
  async getRoundData(key: string): Promise<string | null> {
    const now = Date.now();
    const [result] = await db.select()
      .from(roundStorage)
      .where(
        and(
          eq(roundStorage.key, key),
          sql`(${roundStorage.expiresAt} IS NULL OR ${roundStorage.expiresAt} > ${now})`
        )
      )
      .limit(1);
    return result?.value || null;
  }
  
  async setRoundData(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + (ttl * 1000) : null;
    
    const existing = await db.select()
      .from(roundStorage)
      .where(eq(roundStorage.key, key))
      .limit(1);
    
    if (existing.length > 0) {
      await db.update(roundStorage)
        .set({ value, expiresAt })
        .where(eq(roundStorage.key, key));
    } else {
      await db.insert(roundStorage).values({ key, value, expiresAt });
    }
  }
  
  async deleteRoundData(key: string): Promise<void> {
    await db.delete(roundStorage).where(eq(roundStorage.key, key));
  }
}

export const storage: IStorage = new PostgresStorage();
