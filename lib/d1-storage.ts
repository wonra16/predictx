// Cloudflare D1 Storage for Vercel
// Uses HTTP API to communicate with D1

import { Prediction, UserStats } from './types';

export class D1Storage {
  private apiUrl: string;
  private apiToken: string;
  private accountId: string;
  private databaseId: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.databaseId = process.env.D1_DATABASE_ID || '';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.apiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
  }

  private async query(sql: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`D1 API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result[0];
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  // ============= PREDICTIONS =============

  async savePrediction(prediction: Prediction): Promise<boolean> {
    try {
      await this.query(
        `INSERT INTO predictions (
          id, fid, coin_id, challenge_type, direction,
          current_price, predicted_price, target_price,
          status, score, accuracy, timestamp, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prediction.id,
          prediction.fid,
          prediction.coinId,
          prediction.challengeType,
          prediction.direction,
          prediction.currentPrice,
          prediction.predictedPrice || null,
          prediction.targetPrice || null,
          prediction.status,
          prediction.score || 0,
          prediction.accuracy || 0,
          prediction.timestamp,
          prediction.expiresAt,
        ]
      );
      return true;
    } catch (error) {
      console.error('Error saving prediction:', error);
      return false;
    }
  }

  async getPrediction(id: string): Promise<Prediction | null> {
    try {
      const result = await this.query(
        'SELECT * FROM predictions WHERE id = ?',
        [id]
      );
      return result.results[0] ? this.rowToPrediction(result.results[0]) : null;
    } catch (error) {
      console.error('Error getting prediction:', error);
      return null;
    }
  }

  async updatePrediction(prediction: Prediction): Promise<boolean> {
    try {
      await this.query(
        `UPDATE predictions SET
          status = ?,
          target_price = ?,
          score = ?,
          accuracy = ?
        WHERE id = ?`,
        [
          prediction.status,
          prediction.targetPrice || null,
          prediction.score || 0,
          prediction.accuracy || 0,
          prediction.id,
        ]
      );
      return true;
    } catch (error) {
      console.error('Error updating prediction:', error);
      return false;
    }
  }

  async getUserPredictions(fid: number, limit: number = 10): Promise<Prediction[]> {
    try {
      const result = await this.query(
        'SELECT * FROM predictions WHERE fid = ? ORDER BY timestamp DESC LIMIT ?',
        [fid, limit]
      );
      return result.results.map((row: any) => this.rowToPrediction(row));
    } catch (error) {
      console.error('Error getting user predictions:', error);
      return [];
    }
  }

  async getActivePrediction(fid: number): Promise<Prediction | null> {
    try {
      const now = Date.now();
      const result = await this.query(
        `SELECT * FROM predictions 
         WHERE fid = ? AND status = 'pending' AND expires_at > ?
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [fid, now]
      );
      return result.results[0] ? this.rowToPrediction(result.results[0]) : null;
    } catch (error) {
      console.error('Error getting active prediction:', error);
      return null;
    }
  }

  async getPendingResults(limit: number = 100): Promise<Prediction[]> {
    try {
      const now = Date.now();
      const result = await this.query(
        `SELECT * FROM predictions 
         WHERE status = 'pending' AND expires_at <= ?
         ORDER BY expires_at ASC
         LIMIT ?`,
        [now, limit]
      );
      return result.results.map((row: any) => this.rowToPrediction(row));
    } catch (error) {
      console.error('Error getting pending results:', error);
      return [];
    }
  }

  // ============= USER STATS =============

  async getUserStats(fid: number): Promise<UserStats | null> {
    try {
      const result = await this.query(
        'SELECT * FROM user_stats WHERE fid = ?',
        [fid]
      );
      return result.results[0] ? this.rowToUserStats(result.results[0]) : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  async updateUserStats(stats: UserStats): Promise<boolean> {
    try {
      await this.query(
        `INSERT OR REPLACE INTO user_stats (
          fid, username, display_name, pfp_url,
          total_score, quick_score, big_score,
          total_predictions, quick_predictions, big_predictions,
          won_predictions, lost_predictions, pending_predictions,
          win_rate, average_accuracy, current_streak, longest_streak,
          rank, quick_rank, big_rank, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stats.fid,
          stats.username,
          stats.displayName,
          stats.pfpUrl,
          stats.totalScore,
          stats.quickScore,
          stats.bigScore,
          stats.totalPredictions,
          stats.quickPredictions,
          stats.bigPredictions,
          stats.wonPredictions,
          stats.lostPredictions,
          stats.pendingPredictions,
          stats.winRate,
          stats.averageAccuracy,
          stats.currentStreak,
          stats.longestStreak,
          stats.rank,
          stats.quickRank,
          stats.bigRank,
          Math.floor(Date.now() / 1000),
        ]
      );
      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  async getLeaderboard(type: 'total' | 'quick' | 'big' = 'total', limit: number = 100): Promise<any[]> {
    try {
      const scoreColumn = type === 'quick' ? 'quick_score' : type === 'big' ? 'big_score' : 'total_score';
      
      const result = await this.query(
        `SELECT * FROM user_stats 
         ORDER BY ${scoreColumn} DESC 
         LIMIT ?`,
        [limit]
      );
      
      return result.results.map((row: any, index: number) => ({
        ...this.rowToUserStats(row),
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // ============= ROUND STORAGE =============

  async getStorageClient() {
    return {
      get: async (key: string): Promise<string | null> => {
        try {
          const result = await this.query(
            'SELECT value FROM round_storage WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)',
            [key, Math.floor(Date.now() / 1000)]
          );
          return result.results[0]?.value || null;
        } catch (error) {
          console.error('Error getting storage:', error);
          return null;
        }
      },
      set: async (key: string, value: string, ttl?: number): Promise<void> => {
        try {
          const expiresAt = ttl ? Math.floor(Date.now() / 1000) + ttl : null;
          await this.query(
            'INSERT OR REPLACE INTO round_storage (key, value, expires_at) VALUES (?, ?, ?)',
            [key, value, expiresAt]
          );
        } catch (error) {
          console.error('Error setting storage:', error);
        }
      },
      delete: async (key: string): Promise<void> => {
        try {
          await this.query('DELETE FROM round_storage WHERE key = ?', [key]);
        } catch (error) {
          console.error('Error deleting storage:', error);
        }
      },
    };
  }

  // ============= HELPERS =============

  private rowToPrediction(row: any): Prediction {
    return {
      id: row.id,
      fid: row.fid,
      coinId: row.coin_id,
      challengeType: row.challenge_type,
      direction: row.direction,
      startPrice: row.start_price || row.current_price,
      currentPrice: row.current_price,
      predictedPrice: row.predicted_price,
      targetPrice: row.target_price,
      status: row.status,
      score: row.score,
      accuracy: row.accuracy,
      timestamp: row.timestamp,
      expiresAt: row.expires_at,
    };
  }

  private rowToUserStats(row: any): UserStats {
    return {
      fid: row.fid,
      username: row.username,
      displayName: row.display_name,
      pfpUrl: row.pfp_url,
      totalScore: row.total_score,
      quickScore: row.quick_score,
      bigScore: row.big_score,
      totalPredictions: row.total_predictions,
      quickPredictions: row.quick_predictions,
      bigPredictions: row.big_predictions,
      wonPredictions: row.won_predictions,
      lostPredictions: row.lost_predictions,
      pendingPredictions: row.pending_predictions,
      winRate: row.win_rate,
      averageAccuracy: row.average_accuracy,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      rank: row.rank,
      quickRank: row.quick_rank,
      bigRank: row.big_rank,
      badges: [],
    };
  }
}
