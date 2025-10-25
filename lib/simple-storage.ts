// Simple Storage Wrapper - Cloudflare D1 for Vercel
// Production: Cloudflare D1 (persistent)
// Development: In-memory fallback

import { Prediction, UserStats, LeaderboardEntry } from './types';

// D1 veya in-memory?
const USE_D1 = process.env.USE_D1 === 'true' && !!process.env.D1_DATABASE_ID;

// Fallback in-memory storage for development
const predictions = new Map<string, Prediction>();
const userStats = new Map<number, UserStats>();
const userPredictions = new Map<number, string[]>();
const roundStorage = new Map<string, string>();

// D1 Storage (lazy loaded)
let d1Storage: any = null;

async function getStorage() {
  if (USE_D1) {
    if (!d1Storage) {
      const { D1Storage } = await import('./d1-storage');
      d1Storage = new D1Storage();
    }
    return d1Storage;
  }
  return null;
}

// ============= STORAGE CLIENT =============

export async function getStorageClient() {
  const storage = await getStorage();
  if (storage) {
    return storage.getStorageClient();
  }
  
  // Fallback: in-memory
  return {
    async get(key: string): Promise<string | null> {
      return roundStorage.get(key) || null;
    },
    async set(key: string, value: string, ttl?: number): Promise<void> {
      roundStorage.set(key, value);
      if (ttl) {
        setTimeout(() => roundStorage.delete(key), ttl * 1000);
      }
    },
    async delete(key: string): Promise<void> {
      roundStorage.delete(key);
    }
  };
}

// ============= PREDICTIONS =============

export async function savePrediction(prediction: Prediction): Promise<boolean> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.savePrediction(prediction);
    }

    // Fallback: in-memory
    predictions.set(prediction.id, prediction);
    const userPreds = userPredictions.get(prediction.fid) || [];
    userPreds.push(prediction.id);
    userPredictions.set(prediction.fid, userPreds);
    return true;
  } catch (error) {
    console.error('Error saving prediction:', error);
    return false;
  }
}

export async function getPrediction(id: string): Promise<Prediction | null> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getPrediction(id);
    }
    return predictions.get(id) || null;
  } catch (error) {
    console.error('Error getting prediction:', error);
    return null;
  }
}

export async function updatePrediction(prediction: Prediction): Promise<boolean> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.updatePrediction(prediction);
    }
    predictions.set(prediction.id, prediction);
    return true;
  } catch (error) {
    console.error('Error updating prediction:', error);
    return false;
  }
}

export async function getUserPredictions(
  fid: number,
  limit: number = 10
): Promise<Prediction[]> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getUserPredictions(fid, limit);
    }

    // Fallback: in-memory
    const predIds = userPredictions.get(fid) || [];
    const preds = predIds
      .map((id) => predictions.get(id))
      .filter((p): p is Prediction => p !== null)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    return preds;
  } catch (error) {
    console.error('Error getting user predictions:', error);
    return [];
  }
}

export async function getActivePrediction(fid: number): Promise<Prediction | null> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getActivePrediction(fid);
    }

    // Fallback: in-memory
    const preds = await getUserPredictions(fid, 1);
    if (preds.length === 0) return null;
    
    const latest = preds[0];
    if (latest.status === 'pending' && latest.expiresAt > Date.now()) {
      return latest;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting active prediction:', error);
    return null;
  }
}

export async function getAllPredictions(): Promise<Prediction[]> {
  const storage = await getStorage();
  if (storage) {
    // D1'de limit ekle
    return [];
  }
  return Array.from(predictions.values());
}

export async function getPendingResults(limit: number = 100): Promise<Prediction[]> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getPendingResults(limit);
    }

    // Fallback: in-memory
    const now = Date.now();
    const allPreds = Array.from(predictions.values());
    
    return allPreds
      .filter((p) => p.status === 'pending' && p.expiresAt <= now)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting pending results:', error);
    return [];
  }
}

// ============= USER STATS =============

export async function getUserStats(fid: number): Promise<UserStats | null> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getUserStats(fid);
    }
    return userStats.get(fid) || null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

export async function updateUserStats(stats: UserStats): Promise<boolean> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.updateUserStats(stats);
    }
    userStats.set(stats.fid, stats);
    return true;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
}

export async function initializeUserStats(
  fid: number,
  username: string,
  displayName: string,
  pfpUrl: string
): Promise<UserStats> {
  const stats: UserStats = {
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
  };
  
  await updateUserStats(stats);
  return stats;
}

// ============= LEADERBOARD =============

export async function getLeaderboard(
  type: 'total' | 'quick' | 'big' = 'total',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    const storage = await getStorage();
    if (storage) {
      return await storage.getLeaderboard(type, limit);
    }

    // Fallback: in-memory
    const allStats = Array.from(userStats.values());
    
    const sorted = allStats.sort((a, b) => {
      if (type === 'quick') {
        return b.quickScore - a.quickScore;
      } else if (type === 'big') {
        return b.bigScore - a.bigScore;
      } else {
        return b.totalScore - a.totalScore;
      }
    });
    
    const entries: LeaderboardEntry[] = sorted.slice(0, limit).map((stats, index) => ({
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
    
    return entries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

export async function getUserRank(fid: number): Promise<number> {
  try {
    const storage = await getStorage();
    if (storage) {
      const leaderboard = await storage.getLeaderboard('total', 1000);
      const index = leaderboard.findIndex((entry: any) => entry.fid === fid);
      return index !== -1 ? index + 1 : 0;
    }

    // Fallback: in-memory
    const allStats = Array.from(userStats.values());
    const sorted = allStats.sort((a, b) => b.totalScore - a.totalScore);
    const index = sorted.findIndex((s) => s.fid === fid);
    return index !== -1 ? index + 1 : 0;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return 0;
  }
}

// ============= CLEANUP/RESET =============

export function clearAllData(): void {
  predictions.clear();
  userStats.clear();
  userPredictions.clear();
}
